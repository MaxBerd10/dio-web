from django.urls import path

from .views import (
    LessonProgressUpdateView, MyLessonProgressListView,
    MyQuizAttemptsView,
    MyStreakView, MyXPView,
    AchievementListView, MyAchievementsView,
    LeaderboardView,
    DashboardSummaryView,
    TeacherDashboardView,
    TeacherStudentDetailView,
    AssignStudentToMeView,
    TeacherDifficultTopicsView,
)

app_name = 'progress'

urlpatterns = [
    # Dashboard — asosiy endpoint
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard'),

    # Lesson progress
    path('lessons/<int:lesson_id>/', LessonProgressUpdateView.as_view(), name='lesson-update'),
    path('lessons/', MyLessonProgressListView.as_view(), name='my-lessons'),

    # Quiz history
    path('quiz-attempts/', MyQuizAttemptsView.as_view(), name='quiz-attempts'),

    # Streak & XP
    path('streak/', MyStreakView.as_view(), name='streak'),
    path('xp/', MyXPView.as_view(), name='xp'),

    # Achievements
    path('achievements/', AchievementListView.as_view(), name='achievement-list'),
    path('my-achievements/', MyAchievementsView.as_view(), name='my-achievements'),

    # Leaderboard
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),

    # Teacher
    path('teacher/dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('teacher/students/<int:student_id>/', TeacherStudentDetailView.as_view(), name='teacher-student-detail'),

    path('teacher/students/<int:student_id>/assign/', AssignStudentToMeView.as_view(), name='teacher-assign-student'),
    path('teacher/difficult-topics/', TeacherDifficultTopicsView.as_view(), name='teacher-difficult-topics'),
]