from django.db.models import Count, Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.pagination import StandardPagination
from accounts.permissions import IsStudent
from content.models import Lesson

from .models import (
    LessonProgress, WordProgress,
    QuizAttempt,
    Streak, UserXP,
    Achievement, UserAchievement,
)
from .serializers import (
    LessonProgressSerializer, LessonProgressUpdateSerializer,
    QuizAttemptListSerializer,
    StreakSerializer, UserXPSerializer,
    AchievementSerializer, UserAchievementSerializer,
    LeaderboardEntrySerializer,
    DashboardSummarySerializer,
)


# ============================================================
# 1. LESSON PROGRESS
# ============================================================

class LessonProgressUpdateView(APIView):
    """
    POST /api/progress/lessons/{lesson_id}/
    body: {"action": "start"} yoki {"action": "complete"}
    """
    permission_classes = [IsStudent]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id, is_published=True)

        serializer = LessonProgressUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']

        progress, created = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson,
            defaults={'status': LessonProgress.Status.IN_PROGRESS},
        )

        xp_earned = 0
        if action == 'start':
            if progress.status == LessonProgress.Status.NOT_STARTED:
                progress.status = LessonProgress.Status.IN_PROGRESS
            if not progress.started_at:
                progress.started_at = timezone.now()
            progress.save()

        elif action == 'complete':
            if progress.status != LessonProgress.Status.COMPLETED:
                # XP beriladi faqat birinchi marta tugatganda
                xp_earned = lesson.xp_reward
                progress.xp_earned = xp_earned

                xp_profile, _ = UserXP.objects.get_or_create(student=request.user)
                xp_profile.add_xp(xp_earned)

                streak, _ = Streak.objects.get_or_create(student=request.user)
                streak.record_activity()

            progress.status = LessonProgress.Status.COMPLETED
            progress.completion_percentage = 100
            progress.completed_at = timezone.now()
            if not progress.started_at:
                progress.started_at = timezone.now()
            progress.save()

        return Response({
            'progress': LessonProgressSerializer(progress).data,
            'xp_earned': xp_earned,
        })


class MyLessonProgressListView(generics.ListAPIView):
    """
    GET /api/progress/lessons/?status=completed
    Studentning lesson progressi ro'yxati.
    """
    permission_classes = [IsStudent]
    serializer_class = LessonProgressSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = LessonProgress.objects.filter(
            student=self.request.user,
        ).select_related(
            'lesson__module__course',
        ).order_by('-updated_at')

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs


# ============================================================
# 2. QUIZ HISTORY
# ============================================================

class MyQuizAttemptsView(generics.ListAPIView):
    """GET /api/progress/quiz-attempts/"""
    permission_classes = [IsStudent]
    serializer_class = QuizAttemptListSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return (
            QuizAttempt.objects
            .filter(student=self.request.user)
            .select_related('quiz__lesson')
            .order_by('-started_at')
        )


# ============================================================
# 3. STREAK & XP
# ============================================================

class MyStreakView(APIView):
    """GET /api/progress/streak/"""
    permission_classes = [IsStudent]

    def get(self, request):
        streak, _ = Streak.objects.get_or_create(student=request.user)
        return Response(StreakSerializer(streak).data)


class MyXPView(APIView):
    """GET /api/progress/xp/"""
    permission_classes = [IsStudent]

    def get(self, request):
        xp_profile, _ = UserXP.objects.get_or_create(student=request.user)
        return Response(UserXPSerializer(xp_profile).data)


# ============================================================
# 4. ACHIEVEMENTS
# ============================================================

class AchievementListView(generics.ListAPIView):
    """
    GET /api/progress/achievements/
    Barcha mavjud achievement'lar (qaysisi student'da bor ko'rsatadi).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AchievementSerializer

    def get_queryset(self):
        return Achievement.objects.filter(is_active=True).order_by('category', 'order')


class MyAchievementsView(generics.ListAPIView):
    """GET /api/progress/my-achievements/"""
    permission_classes = [IsStudent]
    serializer_class = UserAchievementSerializer

    def get_queryset(self):
        return (
            UserAchievement.objects
            .filter(student=self.request.user)
            .select_related('achievement')
            .order_by('-earned_at')
        )


# ============================================================
# 5. LEADERBOARD
# ============================================================

class LeaderboardView(APIView):
    """
    GET /api/progress/leaderboard/?period=all|weekly
    Top o'quvchilar ro'yxati.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'all')
        limit = int(request.query_params.get('limit', 20))
        limit = min(limit, 100)

        xp_field = 'weekly_xp' if period == 'weekly' else 'total_xp'

        qs = (
            UserXP.objects
            .select_related('student', 'student__streak')
            .filter(student__role='student')
            .order_by(f'-{xp_field}')[:limit]
        )

        entries = []
        for rank, xp_profile in enumerate(qs, start=1):
            student = xp_profile.student
            try:
                streak_obj = student.streak
                current_streak = streak_obj.current_streak
            except Streak.DoesNotExist:
                current_streak = 0

            entries.append({
                'rank': rank,
                'user_id': student.id,
                'username': student.username,
                'full_name': student.full_name or student.username,
                'avatar': student.avatar.url if student.avatar else None,
                'level': xp_profile.level,
                'xp': getattr(xp_profile, xp_field),
                'current_streak': current_streak,
            })

        serializer = LeaderboardEntrySerializer(entries, many=True)
        return Response({
            'period': period,
            'entries': serializer.data,
        })


# ============================================================
# 6. DASHBOARD SUMMARY (asosiy endpoint!)
# ============================================================

class DashboardSummaryView(APIView):
    """
    GET /api/progress/dashboard/
    Studentning bosh sahifasi uchun hammasi bir joyda.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        now = timezone.now()

        # Streak
        streak, _ = Streak.objects.get_or_create(student=user)

        # XP
        xp_profile, _ = UserXP.objects.get_or_create(student=user)

        # Word stats
        word_stats = WordProgress.objects.filter(student=user).aggregate(
            total=Count('id'),
            mastered=Count('id', filter=Q(status=WordProgress.Status.MASTERED)),
        )
        words_due_now = WordProgress.objects.filter(
            student=user,
            next_review_at__lte=now,
        ).exclude(status=WordProgress.Status.NEW).count()

        # Lesson stats
        lesson_stats = LessonProgress.objects.filter(student=user).aggregate(
            completed=Count('id', filter=Q(status=LessonProgress.Status.COMPLETED)),
            in_progress=Count('id', filter=Q(status=LessonProgress.Status.IN_PROGRESS)),
        )

        # Quiz stats
        quizzes_passed = QuizAttempt.objects.filter(
            student=user, passed=True, status='completed',
        ).values('quiz').distinct().count()

        # Achievement stats
        achievements_earned = UserAchievement.objects.filter(student=user).count()
        achievements_total = Achievement.objects.filter(is_active=True).count()

        # Kunlik maqsad (XP)
        daily_goal_xp = 30  # default — kelajakda user setting'lardan olamiz
        daily_goal_met = xp_profile.daily_xp >= daily_goal_xp

        data = {
            'streak': StreakSerializer(streak).data,
            'xp': UserXPSerializer(xp_profile).data,
            'words_total': word_stats['total'] or 0,
            'words_due_now': words_due_now,
            'words_mastered': word_stats['mastered'] or 0,
            'lessons_completed': lesson_stats['completed'] or 0,
            'lessons_in_progress': lesson_stats['in_progress'] or 0,
            'quizzes_passed': quizzes_passed,
            'achievements_earned': achievements_earned,
            'achievements_total': achievements_total,
            'daily_goal_xp': daily_goal_xp,
            'daily_goal_met': daily_goal_met,
        }
        return Response(data)