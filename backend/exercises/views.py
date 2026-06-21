from django.db import transaction
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.pagination import StandardPagination
from accounts.permissions import IsStudent, IsTeacherOrAdmin
from content.models import Lesson

from .models import (
    Quiz, Question, Choice,
    Assignment, AssignmentSubmission, FeedbackComment,
)
from .serializers import (
    QuizListSerializer, QuizDetailSerializer,
    QuizListAllSerializer,
    QuestionWithAnswerSerializer,
    AnswerSubmitSerializer,
    AssignmentSerializer,
    SubmissionListSerializer, SubmissionDetailSerializer,
    SubmissionSubmitSerializer, SubmissionGradeSerializer,
    FeedbackCommentSerializer,
)


# ============================================================
# A. QUIZ FLOW
# ============================================================
class AllQuizzesListView(generics.ListAPIView):
    """
    GET /api/exercises/quizzes/?track=ielts&level=B1&search=conditional
    Barcha published testlar — track/level/qidiruv filtrlari bilan.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = QuizListAllSerializer
    pagination_class = None

    def get_queryset(self):
        qs = (
            Quiz.objects.filter(
                is_published=True,
                lesson__is_published=True,
                lesson__module__is_published=True,
                lesson__module__course__is_published=True,
            )
            .select_related('lesson__module__course')
            .order_by('lesson__module__course__track', 'lesson__module__course__order', 'order')
        )

        track = self.request.query_params.get('track')
        if track:
            qs = qs.filter(lesson__module__course__track=track)

        level = self.request.query_params.get('level')
        if level:
            qs = qs.filter(lesson__module__course__cefr_level=level)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)

        return qs


class LessonQuizzesView(APIView):
    """GET /api/exercises/lessons/{lesson_id}/quizzes/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id, is_published=True)
        quizzes = (
            lesson.quizzes
            .filter(is_published=True)
            .order_by('order')
        )
        serializer = QuizListSerializer(
            quizzes, many=True, context={'request': request},
        )
        return Response(serializer.data)


class QuizStartView(APIView):
    """
    POST /api/exercises/quizzes/{quiz_id}/start/
    Yangi attempt yaratadi va savollarni qaytaradi.
    """
    permission_classes = [IsStudent]

    def post(self, request, quiz_id):
        from progress.models import QuizAttempt

        quiz = get_object_or_404(Quiz, id=quiz_id, is_published=True)

        # Max attempts tekshiruvi
        if quiz.max_attempts > 0:
            attempts_count = QuizAttempt.objects.filter(
                student=request.user, quiz=quiz, status='completed',
            ).count()
            if attempts_count >= quiz.max_attempts:
                return Response(
                    {'detail': f"Bu testni {quiz.max_attempts} marta urindingiz. Boshqa urinishlar tugadi."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Aktiv attempt bormi? — bo'lsa, shuni qaytaramiz
        active = QuizAttempt.objects.filter(
            student=request.user, quiz=quiz, status='in_progress',
        ).first()
        if active:
            attempt = active
        else:
            # Maksimal ball
            max_score = sum(q.points for q in quiz.questions.all())
            attempt = QuizAttempt.objects.create(
                student=request.user,
                quiz=quiz,
                max_score=max_score,
            )

        # Savollarni qaytarish
        questions = quiz.questions.prefetch_related('choices').order_by('order')
        from .serializers import QuestionForAttemptSerializer
        question_data = QuestionForAttemptSerializer(questions, many=True).data

        # Shuffle bo'lsa frontend o'zi aralashtirsin (yoki shu yerda)
        if quiz.shuffle_questions:
            import random
            random.shuffle(question_data)

        return Response({
            'attempt_id': attempt.id,
            'quiz': QuizDetailSerializer(quiz).data,
            'questions': question_data,
            'started_at': attempt.started_at,
            'time_limit_seconds': quiz.time_limit_seconds,
        })


class AttemptAnswerView(APIView):
    """
    POST /api/exercises/attempts/{attempt_id}/answer/
    Yagona savolga javob saqlash (oraliq).
    """
    permission_classes = [IsStudent]

    def post(self, request, attempt_id):
        from progress.models import QuizAttempt, QuestionResponse

        attempt = get_object_or_404(
            QuizAttempt, id=attempt_id, student=request.user,
        )
        if attempt.status != 'in_progress':
            return Response(
                {'detail': 'Bu attempt tugagan.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AnswerSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        question = get_object_or_404(
            Question, id=data['question_id'], quiz=attempt.quiz,
        )

        # Javobni baholash
        is_correct, points_earned = self._evaluate_answer(question, data)

        # Mavjud javobni yangilash yoki yaratish
        response, _ = QuestionResponse.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={
                'is_correct': is_correct,
                'points_earned': points_earned,
                'text_answer': data.get('text_answer', ''),
                'time_spent_seconds': data.get('time_spent_seconds', 0),
            },
        )

        # Tanlangan variantlarni saqlash
        if data.get('selected_choice_ids'):
            response.selected_choices.set(data['selected_choice_ids'])

        return Response({
            'response_id': response.id,
            'is_correct': is_correct,
            'points_earned': points_earned,
        })

    @staticmethod
    def _evaluate_answer(question, data):
        """Savol turiga qarab javobni baholash."""
        qt = question.question_type
        selected_ids = set(data.get('selected_choice_ids', []))
        text = (data.get('text_answer') or '').strip()

        if qt == Question.QuestionType.MULTIPLE_CHOICE:
            correct = set(
                question.choices.filter(is_correct=True).values_list('id', flat=True)
            )
            is_correct = selected_ids == correct
        elif qt == Question.QuestionType.MULTIPLE_SELECT:
            correct = set(
                question.choices.filter(is_correct=True).values_list('id', flat=True)
            )
            is_correct = selected_ids == correct
        elif qt == Question.QuestionType.TRUE_FALSE:
            expected = (question.correct_answer_text or '').strip().lower()
            is_correct = text.lower() == expected
        elif qt in (Question.QuestionType.FILL_BLANK, Question.QuestionType.SHORT_ANSWER):
            if question.choices.exists():
                # So'z banki rejimi — variant tanlangan
                correct = set(
                    question.choices.filter(is_correct=True).values_list('id', flat=True)
                )
                is_correct = selected_ids == correct
            else:
                # Eski rejim — ochiq matn
                expected = question.correct_answer_text or ''
                if question.case_sensitive:
                    is_correct = text == expected
                else:
                    is_correct = text.lower() == expected.lower()
        elif qt == Question.QuestionType.MATCHING:
            # Matching uchun: frontend match juftliklarini text_answer'ga JSON sifatida jo'natadi
            # Yoki selected_choice_ids — to'g'ri juftliklar ID'lari
            correct = set(
                question.choices.filter(is_correct=True).values_list('id', flat=True)
            )
            is_correct = selected_ids == correct
        else:
            is_correct = False

        points = question.points if is_correct else 0
        return is_correct, points


class AttemptSubmitView(APIView):
    """
    POST /api/exercises/attempts/{attempt_id}/submit/
    Yakuniy submit — ball hisoblanadi, XP beriladi.
    """
    permission_classes = [IsStudent]

    @transaction.atomic
    def post(self, request, attempt_id):
        from progress.models import QuizAttempt, Streak, UserXP

        attempt = get_object_or_404(
            QuizAttempt, id=attempt_id, student=request.user,
        )
        if attempt.status != 'in_progress':
            return Response(
                {'detail': 'Bu attempt allaqachon yakunlangan.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Umumiy ball hisoblash
        responses = attempt.responses.all()
        total_score = sum(r.points_earned for r in responses)

        # Yakuniy ko'rsatkichlar
        attempt.score = total_score
        attempt.percentage = (
            (total_score / attempt.max_score * 100)
            if attempt.max_score > 0 else 0
        )
        attempt.passed = attempt.percentage >= attempt.quiz.passing_score
        attempt.status = 'completed'
        attempt.completed_at = timezone.now()

        # Vaqt
        delta = attempt.completed_at - attempt.started_at
        attempt.time_spent_seconds = int(delta.total_seconds())

        # XP berish (faqat o'tgan bo'lsa)
        xp_earned = 0
        if attempt.passed:
            xp_earned = attempt.quiz.xp_reward
            attempt.xp_earned = xp_earned

            xp_profile, _ = UserXP.objects.get_or_create(student=request.user)
            xp_profile.add_xp(xp_earned)

            streak, _ = Streak.objects.get_or_create(student=request.user)
            streak.record_activity()

        attempt.save()

        # Natija ko'rsatish — javoblari bilan
        from .serializers import QuestionWithAnswerSerializer
        questions = attempt.quiz.questions.prefetch_related('choices').order_by('order')

        # Studentning javoblari
        response_map = {r.question_id: r for r in responses}
        results = []
        for q in questions:
            r = response_map.get(q.id)
            results.append({
                'question': QuestionWithAnswerSerializer(q).data,
                'user_answer': {
                    'is_correct': r.is_correct if r else False,
                    'points_earned': r.points_earned if r else 0,
                    'selected_choice_ids': list(r.selected_choices.values_list('id', flat=True)) if r else [],
                    'text_answer': r.text_answer if r else '',
                },
            })

        return Response({
            'attempt_id': attempt.id,
            'score': attempt.score,
            'max_score': attempt.max_score,
            'percentage': float(attempt.percentage),
            'passed': attempt.passed,
            'xp_earned': xp_earned,
            'time_spent_seconds': attempt.time_spent_seconds,
            'show_correct_answers': attempt.quiz.show_correct_answers,
            'results': results if attempt.quiz.show_correct_answers else None,
        })


# ============================================================
# B. ASSIGNMENT FLOW
# ============================================================

class LessonAssignmentsView(APIView):
    """GET /api/exercises/lessons/{lesson_id}/assignments/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id, is_published=True)
        assignments = lesson.assignments.filter(is_published=True).order_by('order')
        serializer = AssignmentSerializer(
            assignments, many=True, context={'request': request},
        )
        return Response(serializer.data)


class AssignmentDetailView(APIView):
    """GET /api/exercises/assignments/{id}/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        assignment = get_object_or_404(Assignment, id=id, is_published=True)
        serializer = AssignmentSerializer(
            assignment, context={'request': request},
        )
        return Response(serializer.data)


class AssignmentSubmitView(APIView):
    """
    POST /api/exercises/assignments/{id}/submit/
    Student vazifani topshiradi.
    """
    permission_classes = [IsStudent]

    def post(self, request, id):
        assignment = get_object_or_404(Assignment, id=id, is_published=True)

        # Mavjud submission bormi? (Draft yangilanishi mumkin)
        existing = AssignmentSubmission.objects.filter(
            assignment=assignment,
            student=request.user,
        ).exclude(status='graded').first()

        serializer = SubmissionSubmitSerializer(
            existing, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)

        if existing:
            submission = serializer.save(
                status='submitted',
                submitted_at=timezone.now(),
            )
        else:
            submission = serializer.save(
                assignment=assignment,
                student=request.user,
                status='submitted',
                submitted_at=timezone.now(),
            )

        return Response(
            SubmissionDetailSerializer(submission).data,
            status=status.HTTP_201_CREATED,
        )


class MySubmissionsView(generics.ListAPIView):
    """
    GET /api/exercises/my-submissions/
    Student o'z submission'lari ro'yxati.
    """
    permission_classes = [IsStudent]
    serializer_class = SubmissionListSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return (
            AssignmentSubmission.objects
            .filter(student=self.request.user)
            .select_related('assignment', 'student')
            .order_by('-created_at')
        )


class SubmissionDetailView(APIView):
    """
    GET /api/exercises/submissions/{id}/
    Student o'zinikini, teacher hammasini ko'ra oladi.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        submission = get_object_or_404(
            AssignmentSubmission.objects.select_related(
                'assignment', 'student', 'reviewer',
            ).prefetch_related('comments__author'),
            id=id,
        )

        # Permission tekshiruvi
        if request.user.role == 'student':
            if submission.student_id != request.user.id:
                return Response(
                    {'detail': 'Sizning vazifangiz emas.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif request.user.role not in ('teacher', 'admin'):
            return Response(
                {'detail': 'Ruxsat yo\'q.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = SubmissionDetailSerializer(submission)
        return Response(serializer.data)


# ============================================================
# C. TEACHER ENDPOINTS
# ============================================================

class TeacherSubmissionListView(generics.ListAPIView):
    """
    GET /api/exercises/teacher/submissions/?status=submitted
    Teacher panel'da kelgan vazifalar ro'yxati.
    """
    permission_classes = [IsTeacherOrAdmin]
    serializer_class = SubmissionListSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = (
            AssignmentSubmission.objects
            .select_related('assignment', 'student')
            .order_by('-submitted_at', '-created_at')
        )

        # Filter
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        else:
            # Default — draft'ni ko'rsatmaymiz
            qs = qs.exclude(status='draft')

        assignment_id = self.request.query_params.get('assignment')
        if assignment_id:
            qs = qs.filter(assignment_id=assignment_id)

        return qs


class SubmissionClaimView(APIView):
    """
    POST /api/exercises/submissions/{id}/claim/
    Teacher tekshiruvga oladi.
    """
    permission_classes = [IsTeacherOrAdmin]

    def post(self, request, id):
        submission = get_object_or_404(AssignmentSubmission, id=id)
        if submission.status not in ('submitted', 'in_review'):
            return Response(
                {'detail': "Bu submission'ni hozir tekshirib bo'lmaydi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        submission.reviewer = request.user
        submission.status = 'in_review'
        submission.save()
        return Response(SubmissionDetailSerializer(submission).data)


class SubmissionGradeView(APIView):
    """
    POST /api/exercises/submissions/{id}/grade/
    Teacher baho beradi.
    """
    permission_classes = [IsTeacherOrAdmin]

    @transaction.atomic
    def post(self, request, id):
        from progress.models import UserXP

        submission = get_object_or_404(AssignmentSubmission, id=id)

        serializer = SubmissionGradeSerializer(
            submission, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)

        # Default status — graded
        new_status = serializer.validated_data.get('status', 'graded')

        submission = serializer.save(
            reviewer=request.user,
            reviewed_at=timezone.now(),
            status=new_status,
        )

        # Graded bo'lsa student XP oladi
        if new_status == 'graded' and submission.score is not None:
            xp_profile, _ = UserXP.objects.get_or_create(student=submission.student)
            xp_profile.add_xp(submission.assignment.xp_reward)

        return Response(SubmissionDetailSerializer(submission).data)


# ============================================================
# D. FEEDBACK COMMENTS (inline IELTS-style)
# ============================================================

class FeedbackCommentCreateView(generics.CreateAPIView):
    """
    POST /api/exercises/submissions/{submission_id}/comments/
    Teacher matn ichidagi joyga izoh qoldiradi.
    """
    permission_classes = [IsTeacherOrAdmin]
    serializer_class = FeedbackCommentSerializer

    def perform_create(self, serializer):
        submission_id = self.kwargs['submission_id']
        submission = get_object_or_404(AssignmentSubmission, id=submission_id)
        serializer.save(author=self.request.user, submission=submission)


class FeedbackCommentDeleteView(generics.DestroyAPIView):
    """DELETE /api/exercises/comments/{id}/"""
    permission_classes = [IsTeacherOrAdmin]
    queryset = FeedbackComment.objects.all()

    def get_queryset(self):
        # Faqat o'z izohlarini o'chira oladi
        return FeedbackComment.objects.filter(author=self.request.user)