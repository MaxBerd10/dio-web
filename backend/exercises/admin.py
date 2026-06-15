from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Quiz, Question, Choice,
    Assignment, AssignmentSubmission, FeedbackComment,
)


# ============================================================
# Quiz admins
# ============================================================

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4
    fields = ('text', 'is_correct', 'match_pair', 'order')


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 0
    fields = (
        'question_type', 'text', 'correct_answer_text',
        'explanation', 'points', 'order',
    )
    show_change_link = True


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'lesson', 'question_count',
        'passing_score', 'max_attempts', 'is_published',
    )
    list_filter = (
        'lesson__module__course__track',
        'is_published',
    )
    search_fields = ('title', 'description', 'lesson__title')
    autocomplete_fields = ('lesson',)
    inlines = [QuestionInline]

    fieldsets = (
        ('Asosiy', {
            'fields': ('lesson', 'title', 'description'),
        }),
        ('Sozlamalar', {
            'fields': (
                'passing_score', 'time_limit_seconds',
                'max_attempts', 'shuffle_questions', 'show_correct_answers',
            ),
        }),
        ('Mukofot va status', {
            'fields': ('xp_reward', 'order', 'is_published'),
        }),
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text_preview', 'quiz', 'question_type', 'points', 'order')
    list_filter = ('question_type', 'quiz__lesson__module__course__track')
    search_fields = ('text', 'quiz__title')
    autocomplete_fields = ('quiz',)
    inlines = [ChoiceInline]

    fieldsets = (
        ('Quiz', {
            'fields': ('quiz', 'order', 'points'),
        }),
        ('Savol', {
            'fields': ('question_type', 'text', 'image', 'audio_url'),
        }),
        ('Javob (fill-blank / short-answer / true-false uchun)', {
            'fields': ('correct_answer_text', 'case_sensitive'),
        }),
        ('Tushuntirish', {
            'fields': ('explanation',),
        }),
    )

    def text_preview(self, obj):
        return obj.text[:80]
    text_preview.short_description = 'Question'


# ============================================================
# Assignment admins
# ============================================================

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'lesson', 'assignment_type',
        'min_words', 'max_words', 'is_published',
    )
    list_filter = (
        'assignment_type',
        'lesson__module__course__track',
        'is_published',
    )
    search_fields = ('title', 'instructions', 'lesson__title')
    autocomplete_fields = ('lesson',)

    fieldsets = (
        ('Asosiy', {
            'fields': ('lesson', 'title', 'assignment_type'),
        }),
        ('Topshiriq', {
            'fields': ('instructions', 'rubric'),
        }),
        ('Sozlamalar', {
            'fields': ('min_words', 'max_words', 'time_limit_minutes'),
        }),
        ('Mukofot va status', {
            'fields': ('xp_reward', 'order', 'is_published'),
        }),
    )


class FeedbackCommentInline(admin.TabularInline):
    model = FeedbackComment
    extra = 0
    fields = ('category', 'quoted_text', 'comment', 'author')
    readonly_fields = ('author',)


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'assignment', 'status_badge',
        'score', 'word_count', 'submitted_at',
    )
    list_filter = (
        'status',
        'assignment__assignment_type',
        'assignment__lesson__module__course__track',
    )
    search_fields = (
        'student__username', 'student__email',
        'assignment__title', 'content',
    )
    autocomplete_fields = ('assignment', 'student', 'reviewer')
    readonly_fields = ('word_count', 'created_at', 'updated_at')
    inlines = [FeedbackCommentInline]

    fieldsets = (
        ('Topshiriq', {
            'fields': ('assignment', 'student', 'status'),
        }),
        ('Submission kontenti', {
            'fields': ('content', 'audio_file', 'attachment', 'word_count'),
        }),
        ('Vaqtlar', {
            'fields': ('submitted_at', 'reviewed_at', 'created_at', 'updated_at'),
        }),
        ('Teacher review', {
            'fields': ('reviewer', 'score', 'feedback', 'strengths', 'improvements'),
        }),
    )

    def status_badge(self, obj):
        colors = {
            'draft': '#888',
            'submitted': '#2563eb',
            'in_review': '#f59e0b',
            'graded': '#10b981',
            'returned': '#ef4444',
        }
        color = colors.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;'
            'border-radius:10px;font-size:11px;">{}</span>',
            color, obj.get_status_display(),
        )
    status_badge.short_description = 'Status'

    def save_formset(self, request, form, formset, change):
        """FeedbackComment uchun author'ni avtomatik qo'yamiz."""
        instances = formset.save(commit=False)
        for instance in instances:
            if isinstance(instance, FeedbackComment) and not instance.author_id:
                instance.author = request.user
            instance.save()
        formset.save_m2m()


@admin.register(FeedbackComment)
class FeedbackCommentAdmin(admin.ModelAdmin):
    list_display = ('submission', 'author', 'category', 'comment_preview', 'created_at')
    list_filter = ('category',)
    search_fields = ('comment', 'quoted_text')
    autocomplete_fields = ('submission', 'author')

    def comment_preview(self, obj):
        return obj.comment[:60]
    comment_preview.short_description = 'Comment'