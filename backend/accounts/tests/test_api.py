import pytest
from django.contrib.auth import get_user_model

User = get_user_model()
TEST_PASSWORD = 'TestUserPass99!'


@pytest.mark.django_db
class TestAuthAPI:
    def test_student_register_returns_tokens(self, api_client):
        response = api_client.post(
            '/api/auth/register/',
            {
                'email': 'register@test.com',
                'username': 'reguser',
                'full_name': 'Reg User',
                'password': TEST_PASSWORD,
                'password_confirm': TEST_PASSWORD,
                'role': 'student',
                'learning_goal': 'general',
            },
            format='json',
        )
        assert response.status_code == 201
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['email'] == 'register@test.com'
        assert User.objects.filter(email='register@test.com').exists()

    def test_login_with_email(self, api_client, student_user):
        response = api_client.post(
            '/api/auth/login/',
            {'email': student_user.email, 'password': TEST_PASSWORD},
            format='json',
        )
        assert response.status_code == 200
        assert 'access' in response.data
        assert response.data['user']['role'] == 'student'

    def test_login_wrong_password(self, api_client, student_user):
        response = api_client.post(
            '/api/auth/login/',
            {'email': student_user.email, 'password': 'WrongPass99!'},
            format='json',
        )
        assert response.status_code == 401
        assert "noto'g'ri" in response.data['detail'].lower() or 'detail' in response.data

    def test_login_email_case_insensitive(self, api_client, db):
        User.objects.create_user(
            email='MixedCase@test.com',
            username='mixedcase',
            password=TEST_PASSWORD,
            full_name='Mixed Case',
        )
        response = api_client.post(
            '/api/auth/login/',
            {'email': 'mixedcase@test.com', 'password': TEST_PASSWORD},
            format='json',
        )
        assert response.status_code == 200
        assert response.data['user']['email'] == 'mixedcase@test.com'

    def test_me_requires_auth(self, api_client):
        response = api_client.get('/api/auth/me/')
        assert response.status_code == 401

    def test_me_returns_profile(self, auth_client, student_user):
        response = auth_client.get('/api/auth/me/')
        assert response.status_code == 200
        assert response.data['email'] == student_user.email
        assert response.data['full_name'] == student_user.full_name

    def test_me_update_profile(self, auth_client):
        response = auth_client.patch(
            '/api/auth/me/',
            {'full_name': 'Updated Name', 'bio': 'Test bio'},
            format='json',
        )
        assert response.status_code == 200
        assert response.data['full_name'] == 'Updated Name'
        assert response.data['bio'] == 'Test bio'
