from django.urls import path

from .views import (
    LessonQuizzesView,
    QuizStartView, AttemptAnswerView, AttemptSubmitView,
    LessonAssignmentsView, AssignmentDetailView, AssignmentSubmitView,
    MySubmissionsView, SubmissionDetailView,
    TeacherSubmissionListView, SubmissionClaimView, SubmissionGradeView,
    FeedbackCommentCreateView, FeedbackCommentDeleteView,
)

app_name = 'exercises'

urlpatterns = [
    # Lesson context
    path('lessons/<int:lesson_id>/quizzes/', LessonQuizzesView.as_view(), name='lesson-quizzes'),
    path('lessons/<int:lesson_id>/assignments/', LessonAssignmentsView.as_view(), name='lesson-assignments'),

    # Quiz flow
    path('quizzes/<int:quiz_id>/start/', QuizStartView.as_view(), name='quiz-start'),
    path('attempts/<int:attempt_id>/answer/', AttemptAnswerView.as_view(), name='attempt-answer'),
    path('attempts/<int:attempt_id>/submit/', AttemptSubmitView.as_view(), name='attempt-submit'),

    # Assignment flow
    path('assignments/<int:id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    path('assignments/<int:id>/submit/', AssignmentSubmitView.as_view(), name='assignment-submit'),
    path('my-submissions/', MySubmissionsView.as_view(), name='my-submissions'),
    path('submissions/<int:id>/', SubmissionDetailView.as_view(), name='submission-detail'),

    # Teacher
    path('teacher/submissions/', TeacherSubmissionListView.as_view(), name='teacher-submissions'),
    path('submissions/<int:id>/claim/', SubmissionClaimView.as_view(), name='submission-claim'),
    path('submissions/<int:id>/grade/', SubmissionGradeView.as_view(), name='submission-grade'),

    # Feedback comments
    path('submissions/<int:submission_id>/comments/', FeedbackCommentCreateView.as_view(), name='comment-create'),
    path('comments/<int:pk>/', FeedbackCommentDeleteView.as_view(), name='comment-delete'),
]