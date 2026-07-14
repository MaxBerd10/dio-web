import pytest

from progress.models import WordProgress


@pytest.mark.django_db
class TestReviewAPI:
    def test_submit_review_updates_progress(self, auth_client, student_user, word):
        progress = WordProgress.objects.create(student=student_user, word=word)

        response = auth_client.post(
            '/api/vocabulary/review/submit/',
            {'word_id': word.id, 'quality': 4},
            format='json',
        )
        assert response.status_code == 200

        progress.refresh_from_db()
        assert progress.total_reviews == 1
        assert progress.correct_reviews == 1

    def test_review_queue_for_student(self, auth_client, student_user, word):
        WordProgress.objects.create(student=student_user, word=word)

        response = auth_client.get('/api/vocabulary/review/queue/')
        assert response.status_code == 200
        assert 'items' in response.data or 'due_count' in response.data
