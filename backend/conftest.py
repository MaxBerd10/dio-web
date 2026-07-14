import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from content.models import Course, Lesson, Module, Track
from exercises.models import Choice, Question, Quiz
from vocabulary.models import Word

User = get_user_model()

TEST_PASSWORD = 'TestUserPass99!'


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def student_user(db):
    return User.objects.create_user(
        email='student@test.com',
        username='student1',
        password=TEST_PASSWORD,
        full_name='Test Student',
        role=User.Role.STUDENT,
    )


@pytest.fixture
def teacher_user(db):
    return User.objects.create_user(
        email='teacher@test.com',
        username='teacher1',
        password=TEST_PASSWORD,
        full_name='Test Teacher',
        role=User.Role.TEACHER,
    )


@pytest.fixture
def auth_client(api_client, student_user):
    api_client.force_authenticate(user=student_user)
    return api_client


@pytest.fixture
def teacher_client(api_client, teacher_user):
    api_client.force_authenticate(user=teacher_user)
    return api_client


@pytest.fixture
def lesson(db):
    course = Course.objects.create(
        track=Track.GENERAL,
        title='Test Course',
        slug='test-course',
        is_published=True,
    )
    module = Module.objects.create(
        course=course,
        title='Test Module',
        slug='test-module',
        is_published=True,
    )
    return Lesson.objects.create(
        module=module,
        title='Test Lesson',
        slug='test-lesson',
        is_published=True,
    )


@pytest.fixture
def quiz(lesson):
    return Quiz.objects.create(
        lesson=lesson,
        title='Test Quiz',
        is_published=True,
    )


@pytest.fixture
def word(db):
    return Word.objects.create(
        word='hello',
        translation_uz='salom',
        part_of_speech=Word.PartOfSpeech.NOUN,
    )


@pytest.fixture
def mc_question(quiz):
    question = Question.objects.create(
        quiz=quiz,
        question_type=Question.QuestionType.MULTIPLE_CHOICE,
        text='Choose the correct greeting',
        points=2,
    )
    correct = Choice.objects.create(question=question, text='Hello', is_correct=True, order=1)
    Choice.objects.create(question=question, text='Goodbye', is_correct=False, order=2)
    question._correct_choice = correct  # noqa: SLF001 — test helper
    return question
