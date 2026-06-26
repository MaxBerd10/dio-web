from django.urls import path

from django.urls import path
from .views import (
    LessonWordsView,
    WordSetListView, WordSetDetailView,
    ReviewQueueView, ReviewSubmitView,
    StudentWordStatsView,
    WordMatchWordsView, WordMatchResultView,
    HangmanWordView, HangmanResultView,
    ScrambleWordView, ScrambleResultView,
)

app_name = 'vocabulary'

urlpatterns = [
    # Lesson ichidagi so'zlar
    path('lessons/<int:lesson_id>/words/', LessonWordsView.as_view(), name='lesson-words'),

    # WordSets (flashcard collections)
    path('wordsets/', WordSetListView.as_view(), name='wordset-list'),
    path('wordsets/<int:id>/', WordSetDetailView.as_view(), name='wordset-detail'),

    # SRS — Spaced Repetition
    path('review/queue/', ReviewQueueView.as_view(), name='review-queue'),
    path('review/submit/', ReviewSubmitView.as_view(), name='review-submit'),

    # Stats
    path('stats/', StudentWordStatsView.as_view(), name='stats'),

    path('game/words/', WordMatchWordsView.as_view(), name='word-match-words'),
    path('game/result/', WordMatchResultView.as_view(), name='word-match-result'),

    path('game/hangman/word/', HangmanWordView.as_view(), name='hangman-word'),
    path('game/hangman/result/', HangmanResultView.as_view(), name='hangman-result'),

    path('game/scramble/word/', ScrambleWordView.as_view(), name='scramble-word'),
    path('game/scramble/result/', ScrambleResultView.as_view(), name='scramble-result'),
]