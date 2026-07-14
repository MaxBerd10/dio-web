import pytest

from exercises.models import Choice, Question
from exercises.views import AttemptAnswerView


@pytest.mark.django_db
class TestEvaluateAnswer:
    def test_multiple_choice_correct(self, mc_question):
        correct_id = mc_question._correct_choice.id
        is_correct, points = AttemptAnswerView._evaluate_answer(
            mc_question,
            {'selected_choice_ids': [correct_id]},
        )
        assert is_correct is True
        assert points == mc_question.points

    def test_multiple_choice_wrong(self, mc_question):
        wrong = mc_question.choices.filter(is_correct=False).first()
        is_correct, points = AttemptAnswerView._evaluate_answer(
            mc_question,
            {'selected_choice_ids': [wrong.id]},
        )
        assert is_correct is False
        assert points == 0

    def test_true_false_text_match(self, quiz):
        question = Question.objects.create(
            quiz=quiz,
            question_type=Question.QuestionType.TRUE_FALSE,
            text='The sky is blue.',
            correct_answer_text='True',
            points=1,
        )
        is_correct, points = AttemptAnswerView._evaluate_answer(
            question,
            {'text_answer': 'true'},
        )
        assert is_correct is True
        assert points == 1

    def test_fill_blank_open_text_case_insensitive(self, quiz):
        question = Question.objects.create(
            quiz=quiz,
            question_type=Question.QuestionType.FILL_BLANK,
            text='I ___ to school.',
            correct_answer_text='go',
            case_sensitive=False,
            points=2,
        )
        is_correct, _ = AttemptAnswerView._evaluate_answer(
            question,
            {'text_answer': 'Go'},
        )
        assert is_correct is True

    def test_multiple_select_requires_all_correct(self, quiz):
        question = Question.objects.create(
            quiz=quiz,
            question_type=Question.QuestionType.MULTIPLE_SELECT,
            text='Select fruits',
            points=3,
        )
        apple = Choice.objects.create(question=question, text='Apple', is_correct=True, order=1)
        banana = Choice.objects.create(question=question, text='Banana', is_correct=True, order=2)
        Choice.objects.create(question=question, text='Car', is_correct=False, order=3)

        is_correct, points = AttemptAnswerView._evaluate_answer(
            question,
            {'selected_choice_ids': [apple.id, banana.id]},
        )
        assert is_correct is True
        assert points == 3

        is_correct_partial, _ = AttemptAnswerView._evaluate_answer(
            question,
            {'selected_choice_ids': [apple.id]},
        )
        assert is_correct_partial is False
