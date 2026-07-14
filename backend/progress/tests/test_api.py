import pytest

from progress.models import Streak, UserXP


@pytest.mark.django_db
class TestDashboardAPI:
    def test_student_gets_dashboard(self, auth_client, student_user):
        Streak.objects.create(student=student_user)
        UserXP.objects.create(student=student_user)

        response = auth_client.get('/api/progress/dashboard/')
        assert response.status_code == 200
        assert 'streak' in response.data
        assert 'xp' in response.data
        assert 'lessons_completed' in response.data
        assert 'daily_goal_xp' in response.data
        assert 'daily_goal_met' in response.data

    def test_teacher_forbidden(self, teacher_client):
        response = teacher_client.get('/api/progress/dashboard/')
        assert response.status_code == 403

    def test_unauthenticated_forbidden(self, api_client):
        response = api_client.get('/api/progress/dashboard/')
        assert response.status_code == 401
