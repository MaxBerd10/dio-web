from django.db.models import Count, Q, Sum, Avg
from django.shortcuts import get_object_or_404
from django.utils import timezone

from content.models import Course, Module, Lesson
from exercises.models import Quiz, Assignment, AssignmentSubmission

from accounts.models import User
from .models import LessonProgress, Streak


from datetime import timedelta
from accounts.permissions import IsTeacherOrAdmin


from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.pagination import StandardPagination
from accounts.permissions import IsStudent

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


# ============================================================
# TEACHER DASHBOARD
# ============================================================

class TeacherDashboardView(APIView):
    """
    GET /api/progress/teacher/dashboard/
    O'qituvchi uchun: umumiy statistika + studentlar ro'yxati.
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        week_ago = today - timedelta(days=7)

        students = User.objects.filter(role=User.Role.STUDENT)

        # Filtrlar (query params)
        level_filter = request.query_params.get('level')      # masalan ?level=A2
        status_filter = request.query_params.get('status')    # active / inactive / pending

        if level_filter:
            students = students.filter(cefr_level=level_filter)

        total_lessons = Lesson.objects.filter(is_published=True).count()

        # === Umumiy statistika ===
        stats = {
            'total_students': students.count(),
            'active_today': Streak.objects.filter(
                student__role=User.Role.STUDENT, last_activity_date=today,
            ).count(),
            'active_this_week': Streak.objects.filter(
                student__role=User.Role.STUDENT, last_activity_date__gte=week_ago,
            ).count(),
            'pending_submissions': AssignmentSubmission.objects.filter(
                student__role=User.Role.STUDENT,
                status__in=[AssignmentSubmission.Status.SUBMITTED, AssignmentSubmission.Status.IN_REVIEW],
            ).count(),
            'average_streak': round(
                Streak.objects.filter(student__role=User.Role.STUDENT)
                .aggregate(avg=Avg('current_streak'))['avg'] or 0, 1,
            ),
            'total_lessons': total_lessons,
        }

        # === Studentlar ro'yxati ===
        students = students.select_related('xp_profile', 'streak').annotate(
            pending_count=Count(
                'assignment_submissions',
                filter=Q(assignment_submissions__status__in=[
                    AssignmentSubmission.Status.SUBMITTED,
                    AssignmentSubmission.Status.IN_REVIEW,
                ]),
            ),
            completed_lessons=Count(
                'lesson_progress',
                filter=Q(lesson_progress__status=LessonProgress.Status.COMPLETED),
            ),
        )

        if status_filter == 'pending':
            students = students.filter(pending_count__gt=0)

        student_list = []
        for s in students:
            streak = getattr(s, 'streak', None)
            xp_profile = getattr(s, 'xp_profile', None)

            last_active = streak.last_activity_date if streak else None

            if last_active == today:
                activity_status = 'active'
            elif last_active and last_active >= week_ago:
                activity_status = 'recent'
            elif last_active:
                activity_status = 'inactive'
            else:
                activity_status = 'never'

            # Status filter (faollikka qarab) — annotate'dan keyin Python darajasida
            if status_filter == 'active' and activity_status != 'active':
                continue
            if status_filter == 'inactive' and activity_status not in ('inactive', 'never'):
                continue

            student_list.append({
                'id': s.id,
                'username': s.username,
                'full_name': s.full_name or s.username,
                'cefr_level': s.cefr_level,
                'xp': xp_profile.total_xp if xp_profile else 0,
                'level': xp_profile.level if xp_profile else 1,
                'current_streak': streak.current_streak if streak else 0,
                'longest_streak': streak.longest_streak if streak else 0,
                'last_active': last_active.isoformat() if last_active else None,
                'activity_status': activity_status,
                'pending_submissions': s.pending_count,
                'completed_lessons': s.completed_lessons,
                'lesson_progress_pct': round(
                    (s.completed_lessons / total_lessons * 100) if total_lessons else 0,
                ),
            })

        # Eng faolsizlarni tepaga chiqaramiz (e'tibor talab qiladiganlar)
        student_list.sort(key=lambda x: (x['pending_submissions'] == 0, x['last_active'] or ''))

        return Response({
            'stats': stats,
            'students': student_list,
        })


# ============================================================
# TEACHER — STUDENT DETAIL (batafsil sahifa)
# ============================================================

class TeacherStudentDetailView(APIView):
    """
    GET /api/progress/teacher/students/<id>/
    Bitta studentning barcha kurs/modul/dars/test/vazifa natijalari.
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request, student_id):
        student = get_object_or_404(User, id=student_id, role=User.Role.STUDENT)

        lesson_progress_map = {
            lp.lesson_id: lp
            for lp in LessonProgress.objects.filter(student=student)
        }

        best_quiz_map = {}
        for qa in QuizAttempt.objects.filter(
            student=student, status=QuizAttempt.Status.COMPLETED,
        ).order_by('quiz_id', '-percentage'):
            if qa.quiz_id not in best_quiz_map:
                best_quiz_map[qa.quiz_id] = qa

        submission_map = {
            sub.assignment_id: sub
            for sub in AssignmentSubmission.objects.filter(
                student=student,
            ).order_by('-created_at')
        }

        courses = (
            Course.objects.filter(is_published=True)
            .prefetch_related('modules__lessons__quizzes', 'modules__lessons__assignments')
            .order_by('track', 'order')
        )

        result = []
        for course in courses:
            modules_data = []
            for module in course.modules.filter(is_published=True).order_by('order'):
                lessons_data = []
                for lesson in module.lessons.filter(is_published=True).order_by('order'):
                    lp = lesson_progress_map.get(lesson.id)

                    quizzes_data = []
                    for quiz in lesson.quizzes.all():
                        best = best_quiz_map.get(quiz.id)
                        quizzes_data.append({
                            'id': quiz.id,
                            'title': quiz.title,
                            'attempted': best is not None,
                            'best_score': float(best.percentage) if best else None,
                            'passed': best.passed if best else False,
                        })

                    assignments_data = []
                    for assignment in lesson.assignments.all():
                        sub = submission_map.get(assignment.id)
                        assignments_data.append({
                            'id': assignment.id,
                            'title': assignment.title,
                            'status': sub.status if sub else None,
                            'status_display': sub.get_status_display() if sub else "Topshirilmagan",
                            'score': float(sub.score) if sub and sub.score is not None else None,
                        })

                    lessons_data.append({
                        'id': lesson.id,
                        'title': lesson.title,
                        'lesson_type': lesson.lesson_type,
                        'status': lp.status if lp else 'not_started',
                        'completion_percentage': lp.completion_percentage if lp else 0,
                        'xp_earned': lp.xp_earned if lp else 0,
                        'quizzes': quizzes_data,
                        'assignments': assignments_data,
                    })

                modules_data.append({
                    'id': module.id,
                    'title': module.title,
                    'lessons': lessons_data,
                })

            result.append({
                'id': course.id,
                'title': course.title,
                'track': course.track,
                'modules': modules_data,
            })

        return Response({
            'student': {
                'id': student.id,
                'username': student.username,
                'full_name': student.full_name,
                'cefr_level': student.cefr_level,
            },
            'courses': result,
        })