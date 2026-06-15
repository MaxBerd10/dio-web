from rest_framework import serializers
from .models import GrammarTopic, GrammarRule, GrammarExample, LessonGrammar


class GrammarExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrammarExample
        fields = (
            'id', 'sentence', 'translation', 'highlight',
            'is_incorrect', 'audio_url', 'order',
        )


class GrammarRuleSerializer(serializers.ModelSerializer):
    examples = GrammarExampleSerializer(many=True, read_only=True)

    class Meta:
        model = GrammarRule
        fields = (
            'id', 'title', 'formula',
            'explanation', 'explanation_uz',
            'tips', 'common_mistakes',
            'order', 'examples',
        )


class GrammarTopicListSerializer(serializers.ModelSerializer):
    """Grammar reference sahifasi uchun — qisqa."""
    category_display = serializers.CharField(
        source='get_category_display', read_only=True,
    )
    rule_count = serializers.SerializerMethodField()

    class Meta:
        model = GrammarTopic
        fields = (
            'id', 'title', 'slug',
            'category', 'category_display', 'cefr_level',
            'short_description', 'icon', 'order', 'rule_count',
        )

    def get_rule_count(self, obj):
        return obj.rules.filter(is_published=True).count()


class GrammarTopicDetailSerializer(serializers.ModelSerializer):
    """Grammar mavzu sahifasi — barcha qoidalar + misollar bilan."""
    category_display = serializers.CharField(
        source='get_category_display', read_only=True,
    )
    rules = serializers.SerializerMethodField()

    class Meta:
        model = GrammarTopic
        fields = (
            'id', 'title', 'slug',
            'category', 'category_display', 'cefr_level',
            'short_description', 'description',
            'icon', 'order', 'rules',
        )

    def get_rules(self, obj):
        published = obj.rules.filter(is_published=True).order_by('order')
        return GrammarRuleSerializer(published, many=True).data


class LessonGrammarSerializer(serializers.ModelSerializer):
    """Lesson ichidagi grammar — through model."""
    topic = GrammarTopicDetailSerializer(read_only=True)

    class Meta:
        model = LessonGrammar
        fields = ('id', 'topic', 'order', 'is_main_topic')