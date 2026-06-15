from django.contrib import admin
from .models import Course, Module, Lesson
from vocabulary.admin import LessonWordInline
from grammar.admin import LessonGrammarInline


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0
    fields = ('title', 'order', 'is_published')
    show_change_link = True


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ('title', 'lesson_type', 'order', 'estimated_minutes', 'is_published')
    show_change_link = True


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'track', 'cefr_level', 'ielts_skill', 'order', 'is_published')
    list_filter = ('track', 'cefr_level', 'ielts_skill', 'is_published')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('track', 'order')
    inlines = [ModuleInline]

    fieldsets = (
        ('Asosiy', {
            'fields': ('track', 'title', 'slug', 'description'),
        }),
        ('Track-specific', {
            'fields': ('cefr_level', 'ielts_skill'),
            'description': 'CEFR track uchun cefr_level, IELTS track uchun ielts_skill',
        }),
        ('Display', {
            'fields': ('icon', 'color', 'cover_image', 'order'),
        }),
        ('Status', {
            'fields': ('is_published',),
        }),
    )


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'is_published')
    list_filter = ('course__track', 'course', 'is_published')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('course', 'order')
    inlines = [LessonInline]
    autocomplete_fields = ('course',)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'module', 'lesson_type',
        'estimated_minutes', 'xp_reward', 'order', 'is_published',
    )
    list_filter = (
        'module__course__track', 'lesson_type',
        'is_published', 'is_premium',
    )
    search_fields = ('title', 'description', 'content')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('module', 'order')
    autocomplete_fields = ('module',)
    inlines = [LessonWordInline, LessonGrammarInline]

    fieldsets = (
        ('Asosiy', {
            'fields': ('module', 'title', 'slug', 'lesson_type', 'description'),
        }),
        ('Material', {
            'fields': ('content', 'video_url', 'audio_url'),
        }),
        ('Sozlamalar', {
            'fields': ('estimated_minutes', 'xp_reward', 'order'),
        }),
        ('Status', {
            'fields': ('is_published', 'is_premium'),
        }),
    )