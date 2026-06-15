from django.contrib import admin
from .models import Word, LessonWord, WordSet


class LessonWordInline(admin.TabularInline):
    """Lesson admin'ida ichkari so'z qo'shish uchun (keyin content/admin'ga ham qo'shamiz)."""
    model = LessonWord
    extra = 1
    autocomplete_fields = ('word',)
    fields = ('word', 'order', 'is_key_word')


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = (
        'word', 'part_of_speech', 'translation_uz',
        'cefr_level', 'frequency_rank', 'is_published',
    )
    list_filter = ('cefr_level', 'part_of_speech', 'is_published')
    search_fields = ('word', 'translation_uz', 'translation_ru', 'example_sentence')
    ordering = ('word',)
    list_per_page = 50

    fieldsets = (
        ('Asosiy', {
            'fields': ('word', 'part_of_speech', 'translation_uz', 'translation_ru'),
        }),
        ('Talaffuz', {
            'fields': ('pronunciation', 'audio_url'),
        }),
        ('Misol', {
            'fields': ('example_sentence', 'example_translation'),
        }),
        ('Klassifikatsiya', {
            'fields': ('cefr_level', 'frequency_rank'),
        }),
        ('Qo\'shimcha', {
            'fields': ('image', 'notes', 'is_published'),
        }),
    )


@admin.register(LessonWord)
class LessonWordAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'word', 'order', 'is_key_word')
    list_filter = ('is_key_word', 'lesson__module__course__track')
    search_fields = ('lesson__title', 'word__word')
    autocomplete_fields = ('lesson', 'word')
    ordering = ('lesson', 'order')


@admin.register(WordSet)
class WordSetAdmin(admin.ModelAdmin):
    list_display = ('title', 'cefr_level', 'word_count', 'order', 'is_published')
    list_filter = ('cefr_level', 'is_published')
    search_fields = ('title', 'description')
    filter_horizontal = ('words',)
    ordering = ('order', 'title')