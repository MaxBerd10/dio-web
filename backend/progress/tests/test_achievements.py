import pytest

from progress.achievements import check_and_award_achievements
from progress.models import Achievement, Streak, UserAchievement, UserXP


@pytest.fixture
def achievements(db):
    items = [
        Achievement.objects.create(
            code='streak_3',
            category='streak',
            title='3 kun',
            description='3 kun streak',
            target_value=3,
            xp_reward=10,
            icon='🔥',
            order=1,
        ),
        Achievement.objects.create(
            code='xp_100',
            category='xp',
            title='100 XP',
            description='100 XP',
            target_value=100,
            xp_reward=20,
            icon='⚡',
            order=2,
        ),
    ]
    return items


@pytest.mark.django_db
class TestCheckAndAwardAchievements:
    def test_awards_streak_achievement(self, student_user, achievements):
        Streak.objects.create(student=student_user, current_streak=3)

        awarded = check_and_award_achievements(student_user)

        assert len(awarded) == 1
        assert awarded[0].code == 'streak_3'
        assert UserAchievement.objects.filter(student=student_user).count() == 1

    def test_does_not_duplicate_awards(self, student_user, achievements):
        Streak.objects.create(student=student_user, current_streak=5)

        check_and_award_achievements(student_user)
        awarded_again = check_and_award_achievements(student_user)

        assert awarded_again == []
        assert UserAchievement.objects.filter(student=student_user).count() == 1

    def test_xp_achievement_chain(self, student_user, achievements):
        UserXP.objects.create(student=student_user, total_xp=100)

        awarded = check_and_award_achievements(student_user)

        assert any(a.code == 'xp_100' for a in awarded)
        xp = UserXP.objects.get(student=student_user)
        assert xp.total_xp == 120  # 100 + 20 reward

    def test_no_award_when_below_target(self, student_user, achievements):
        Streak.objects.create(student=student_user, current_streak=1)

        awarded = check_and_award_achievements(student_user)

        assert awarded == []
