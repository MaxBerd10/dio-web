from rest_framework import serializers
from .models import Word, LessonWord, WordSet


class WordSerializer(serializers.ModelSerializer):
    """Yagona so'z — to'liq ma'lumot bilan."""
    part_of_speech_display = serializers.CharField(
        source='get_part_of_speech_display', read_only=True,
    )

    class Meta:
        model = Word
        fields = (
            'id', 'word',
            'translation_uz', 'translation_ru',
            'part_of_speech', 'part_of_speech_display',
            'pronunciation', 'audio_url',
            'example_sentence', 'example_translation',
            'cefr_level',
            'image', 'notes', 'frequency_rank',
        )


class WordCompactSerializer(serializers.ModelSerializer):
    """So'z ro'yxatlari uchun — kichik versiya."""
    class Meta:
        model = Word
        fields = (
            'id', 'word', 'translation_uz',
            'part_of_speech', 'pronunciation',
            'cefr_level',
        )


class LessonWordSerializer(serializers.ModelSerializer):
    """Lesson ichidagi so'z — order va is_key_word bilan."""
    word = WordSerializer(read_only=True)

    class Meta:
        model = LessonWord
        fields = ('id', 'word', 'order', 'is_key_word')


class WordSetListSerializer(serializers.ModelSerializer):
    """WordSet ro'yxati uchun."""
    word_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = WordSet
        fields = (
            'id', 'title', 'description',
            'cefr_level', 'cover_image', 'icon',
            'word_count', 'order',
        )


class WordSetDetailSerializer(serializers.ModelSerializer):
    """WordSet + ichidagi barcha so'zlar."""
    words = WordSerializer(many=True, read_only=True)
    word_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = WordSet
        fields = (
            'id', 'title', 'description',
            'cefr_level', 'cover_image', 'icon',
            'word_count', 'words',
        )