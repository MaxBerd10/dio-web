import pytest
from django.utils import timezone
from freezegun import freeze_time

from progress.models import Streak, UserXP, WordProgress


@pytest.mark.django_db
class TestWordProgressApplyReview:
    def test_low_quality_resets_repetitions(self, student_user, word):
        progress = WordProgress.objects.create(student=student_user, word=word)
        progress.repetitions = 3
        progress.interval_days = 10
        progress.save()

        progress.apply_review(quality=1)

        progress.refresh_from_db()
        assert progress.repetitions == 0
        assert progress.interval_days == 1
        assert progress.status == WordProgress.Status.LEARNING

    def test_high_quality_increases_interval(self, student_user, word):
        progress = WordProgress.objects.create(student=student_user, word=word)

        progress.apply_review(quality=4)
        progress.refresh_from_db()
        assert progress.repetitions == 1
        assert progress.interval_days == 1
        assert progress.correct_reviews == 1

        progress.apply_review(quality=5)
        progress.refresh_from_db()
        assert progress.repetitions == 2
        assert progress.interval_days == 6

    def test_invalid_quality_raises(self, student_user, word):
        progress = WordProgress.objects.create(student=student_user, word=word)
        with pytest.raises(ValueError, match='quality must be 0-5'):
            progress.apply_review(quality=6)


@pytest.mark.django_db
class TestStreakRecordActivity:
    @freeze_time('2026-07-14')
    def test_first_activity_starts_streak(self, student_user):
        streak = Streak.objects.create(student=student_user)
        streak.record_activity()
        streak.refresh_from_db()
        assert streak.current_streak == 1
        assert streak.longest_streak == 1
        assert streak.last_activity_date.isoformat() == '2026-07-14'

    @freeze_time('2026-07-14')
    def test_consecutive_day_increments_streak(self, student_user):
        streak = Streak.objects.create(
            student=student_user,
            current_streak=3,
            longest_streak=3,
            last_activity_date=timezone.datetime(2026, 7, 13).date(),
        )
        streak.record_activity()
        streak.refresh_from_db()
        assert streak.current_streak == 4
        assert streak.longest_streak == 4

    @freeze_time('2026-07-14')
    def test_gap_resets_streak(self, student_user):
        streak = Streak.objects.create(
            student=student_user,
            current_streak=5,
            longest_streak=5,
            last_activity_date=timezone.datetime(2026, 7, 10).date(),
        )
        streak.record_activity()
        streak.refresh_from_db()
        assert streak.current_streak == 1

    @freeze_time('2026-07-14')
    def test_same_day_is_idempotent(self, student_user):
        streak = Streak.objects.create(
            student=student_user,
            current_streak=2,
            last_activity_date=timezone.datetime(2026, 7, 14).date(),
        )
        streak.record_activity()
        streak.refresh_from_db()
        assert streak.current_streak == 2


@pytest.mark.django_db
class TestUserXP:
    def test_xp_for_level_formula(self):
        assert UserXP.xp_for_level(1) == 100
        assert UserXP.xp_for_level(2) == 300

    def test_add_xp_increases_totals(self, student_user):
        xp = UserXP.objects.create(student=student_user)
        xp.add_xp(50)
        xp.refresh_from_db()
        assert xp.total_xp == 50
        assert xp.daily_xp == 50
        assert xp.weekly_xp == 50

    def test_add_xp_levels_up(self, student_user):
        xp = UserXP.objects.create(student=student_user, total_xp=95, level=1)
        xp.add_xp(10)
        xp.refresh_from_db()
        assert xp.level >= 2
