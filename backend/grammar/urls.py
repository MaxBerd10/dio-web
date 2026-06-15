from django.urls import path

from .views import (
    GrammarTopicListView,
    GrammarTopicDetailView,
    LessonGrammarView,
    GrammarCategoriesView,
)

app_name = 'grammar'

urlpatterns = [
    path('topics/', GrammarTopicListView.as_view(), name='topic-list'),
    path('topics/<int:id>/', GrammarTopicDetailView.as_view(), name='topic-detail'),
    path('lessons/<int:lesson_id>/', LessonGrammarView.as_view(), name='lesson-grammar'),
    path('categories/', GrammarCategoriesView.as_view(), name='categories'),
]