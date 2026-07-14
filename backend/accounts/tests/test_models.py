import pytest
from freezegun import freeze_time

from accounts.models import PasswordResetToken


@pytest.mark.django_db
class TestPasswordResetToken:
    def test_valid_when_fresh(self, student_user):
        token = PasswordResetToken.objects.create(user=student_user)
        assert token.is_valid is True

    def test_invalid_when_used(self, student_user):
        token = PasswordResetToken.objects.create(user=student_user, used=True)
        assert token.is_valid is False

    @freeze_time('2026-07-14 12:00:00')
    def test_invalid_after_one_hour(self, student_user):
        with freeze_time('2026-07-14 10:30:00'):
            token = PasswordResetToken.objects.create(user=student_user)
        assert token.is_valid is False


@pytest.mark.django_db
class TestUserRoleProperties:
    def test_student_flags(self, student_user):
        assert student_user.is_student is True
        assert student_user.is_teacher is False

    def test_teacher_flags(self, teacher_user):
        assert teacher_user.is_teacher is True
        assert teacher_user.is_student is False
