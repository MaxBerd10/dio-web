import pytest
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from accounts.serializers import RegisterSerializer

User = get_user_model()


@pytest.mark.django_db
class TestRegisterSerializer:
    def test_student_registration_valid(self):
        data = {
            'email': 'newstudent@test.com',
            'username': 'newstudent',
            'full_name': 'New Student',
            'password': 'TestUserPass99!',
            'password_confirm': 'TestUserPass99!',
            'role': 'student',
            'learning_goal': 'general',
        }
        serializer = RegisterSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        assert user.role == User.Role.STUDENT
        assert user.check_password('TestUserPass99!')

    def test_password_mismatch_rejected(self):
        data = {
            'email': 'mismatch@test.com',
            'username': 'mismatch',
            'full_name': 'Mismatch User',
            'password': 'TestUserPass99!',
            'password_confirm': 'DifferentPass99!',
            'role': 'student',
        }
        serializer = RegisterSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password_confirm' in serializer.errors

    def test_teacher_requires_valid_invite_code(self, settings):
        settings.TEACHER_INVITE_CODE = 'secret-code'
        data = {
            'email': 'teacher@test.com',
            'username': 'newteacher',
            'full_name': 'New Teacher',
            'password': 'TestUserPass99!',
            'password_confirm': 'TestUserPass99!',
            'role': 'teacher',
            'invite_code': 'wrong-code',
        }
        serializer = RegisterSerializer(data=data)
        assert not serializer.is_valid()
        assert 'invite_code' in serializer.errors

    def test_teacher_with_valid_invite_code(self, settings):
        settings.TEACHER_INVITE_CODE = 'secret-code'
        data = {
            'email': 'teacher2@test.com',
            'username': 'newteacher2',
            'full_name': 'New Teacher',
            'password': 'TestUserPass99!',
            'password_confirm': 'TestUserPass99!',
            'role': 'teacher',
            'invite_code': 'secret-code',
        }
        serializer = RegisterSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        assert user.role == User.Role.TEACHER

    def test_admin_role_blocked(self):
        data = {
            'email': 'admin@test.com',
            'username': 'fakeadmin',
            'full_name': 'Fake Admin',
            'password': 'TestUserPass99!',
            'password_confirm': 'TestUserPass99!',
            'role': 'admin',
        }
        serializer = RegisterSerializer(data=data)
        assert not serializer.is_valid()
        assert 'role' in serializer.errors
