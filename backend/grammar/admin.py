from django.contrib import admin
from .models import GrammarTopic, GrammarRule, GrammarExample, LessonGrammar


class GrammarExampleInline(admin.TabularInline):
    model = GrammarExample
    extra = 1
    fields = ('sentence', 'translation', 'highlight', 'is_incorrect', 'order')


class GrammarRuleInline(admin.StackedInline):
    model = GrammarRule
    extra = 0
    fields = ('title', 'formula', 'order', 'is_published')
    show_change_link = True


class LessonGrammarInline(admin.TabularInline):
    """Lesson admin ichida ko'rsatish uchun (content/admin'ga qo'shamiz)."""
    model = LessonGrammar
    extra = 1
    autocomplete_fields = ('topic',)
    fields = ('topic', 'order', 'is_main_topic')


@admin.register(GrammarTopic)
class GrammarTopicAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'category', 'cefr_level',
        'order', 'is_published',
    )
    list_filter = ('category', 'cefr_level', 'is_published')
    search_fields = ('title', 'description', 'short_description')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('category', 'order')
    inlines = [GrammarRuleInline]

    fieldsets = (
        ('Asosiy', {
            'fields': ('title', 'slug', 'category', 'cefr_level'),
        }),
        ('Tarif', {
            'fields': ('short_description', 'description'),
        }),
        ('Display', {
            'fields': ('icon', 'order', 'is_published'),
        }),
    )


@admin.register(GrammarRule)
class GrammarRuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic', 'order', 'is_published')
    list_filter = ('topic__category', 'topic__cefr_level', 'is_published')
    search_fields = ('title', 'explanation', 'topic__title')
    autocomplete_fields = ('topic',)
    ordering = ('topic', 'order')
    inlines = [GrammarExampleInline]

    fieldsets = (
        ('Asosiy', {
            'fields': ('topic', 'title', 'formula', 'order'),
        }),
        ('Tushuntirish', {
            'fields': ('explanation', 'explanation_uz'),
        }),
        ('Qo\'shimcha', {
            'fields': ('tips', 'common_mistakes'),
        }),
        ('Status', {
            'fields': ('is_published',),
        }),
    )


@admin.register(GrammarExample)
class GrammarExampleAdmin(admin.ModelAdmin):
    list_display = ('sentence_preview', 'rule', 'is_incorrect', 'order')
    list_filter = ('is_incorrect', 'rule__topic__category')
    search_fields = ('sentence', 'translation')
    autocomplete_fields = ('rule',)
    ordering = ('rule', 'order')

    def sentence_preview(self, obj):
        marker = "❌ " if obj.is_incorrect else "✓ "
        return f"{marker}{obj.sentence[:80]}"
    sentence_preview.short_description = 'Sentence'


@admin.register(LessonGrammar)
class LessonGrammarAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'topic', 'is_main_topic', 'order')
    list_filter = ('is_main_topic', 'lesson__module__course__track')
    search_fields = ('lesson__title', 'topic__title')
    autocomplete_fields = ('lesson', 'topic')