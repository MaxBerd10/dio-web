from django.contrib import admin
from django.utils.html import format_html
from .models import (
    LessonProgress, WordProgress,
    QuizAttempt, QuestionResponse,
    Streak, UserXP,
    Achievement, UserAchievement,
)


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'lesson', 'status',
        'completion_percentage', 'xp_earned', 'updated_at',
    )
    list_filter = ('status', 'lesson__module__course__track')
    search_fields = ('student__username', 'lesson__title')
    autocomplete_fields = ('student', 'lesson')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(WordProgress)
class WordProgressAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'word', 'status',
        'ease_factor', 'interval_days', 'repetitions',
        'accuracy', 'next_review_at',
    )
    list_filter = ('status', 'word__cefr_level')
    search_fields = ('student__username', 'word__word', 'word__translation_uz')
    autocomplete_fields = ('student', 'word')
    readonly_fields = (
        'total_reviews', 'correct_reviews', 'lapses',
        'first_seen_at', 'updated_at',
    )

    def accuracy(self, obj):
        if obj.total_reviews == 0:
            return '—'
        pct = (obj.correct_reviews / obj.total_reviews) * 100
        return f'{pct:.1f}%'
    accuracy.short_description = 'Aniqlik'


class QuestionResponseInline(admin.TabularInline):
    model = QuestionResponse
    extra = 0
    readonly_fields = (
        'question', 'is_correct', 'points_earned',
        'time_spent_seconds', 'answered_at',
    )
    can_delete = False


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'quiz', 'status', 'score_display',
        'passed_badge', 'time_spent_seconds', 'started_at',
    )
    list_filter = ('status', 'passed', 'quiz__lesson__module__course__track')
    search_fields = ('student__username', 'quiz__title')
    autocomplete_fields = ('student', 'quiz')
    inlines = [QuestionResponseInline]
    readonly_fields = (
        'started_at', 'completed_at',
        'time_spent_seconds', 'percentage',
    )

    def score_display(self, obj):
        return f'{obj.score}/{obj.max_score} ({obj.percentage}%)'
    score_display.short_description = 'Ball'

    def passed_badge(self, obj):
        if obj.status != 'completed':
            return '—'
        color = '#10b981' if obj.passed else '#ef4444'
        label = "O'tdi" if obj.passed else "O'tmadi"
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;'
            'border-radius:10px;font-size:11px;">{}</span>',
            color, label,
        )
    passed_badge.short_description = 'Holat'


@admin.register(QuestionResponse)
class QuestionResponseAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'is_correct', 'points_earned')
    list_filter = ('is_correct', 'question__question_type')
    search_fields = ('attempt__student__username', 'question__text')
    autocomplete_fields = ('attempt', 'question')


@admin.register(Streak)
class StreakAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'current_streak', 'longest_streak',
        'last_activity_date', 'freeze_count',
    )
    search_fields = ('student__username', 'student__email')
    autocomplete_fields = ('student',)
    ordering = ('-current_streak',)


@admin.register(UserXP)
class UserXPAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'level', 'total_xp',
        'weekly_xp', 'daily_xp', 'last_xp_earned_at',
    )
    search_fields = ('student__username', 'student__email')
    autocomplete_fields = ('student',)
    ordering = ('-total_xp',)


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = (
        'icon', 'title', 'category',
        'target_value', 'xp_reward', 'is_active',
    )
    list_filter = ('category', 'is_active')
    search_fields = ('code', 'title', 'description')
    prepopulated_fields = {'code': ('title',)}
    ordering = ('category', 'order')


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('student', 'achievement', 'earned_at')
    list_filter = ('achievement__category',)
    search_fields = ('student__username', 'achievement__title')
    autocomplete_fields = ('student', 'achievement')
    ordering = ('-earned_at',)