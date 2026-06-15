from rest_framework import serializers
from .models import Course, Module, Lesson, Track


class TrackSerializer(serializers.Serializer):
    """Track — enum-based, model emas. Statik ro'yxat sifatida qaytaramiz."""
    code = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()
    course_count = serializers.IntegerField()


class LessonListSerializer(serializers.ModelSerializer):
    """Module ichidagi lessonlar uchun qisqa serializer."""
    class Meta:
        model = Lesson
        fields = (
            'id', 'title', 'slug', 'lesson_type',
            'description', 'estimated_minutes', 'xp_reward',
            'order', 'is_premium',
        )


class LessonDetailSerializer(serializers.ModelSerializer):
    """Yagona lesson uchun to'liq serializer."""
    track = serializers.CharField(read_only=True)
    cefr_level = serializers.CharField(read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)

    word_count = serializers.SerializerMethodField()
    grammar_topic_count = serializers.SerializerMethodField()
    quiz_count = serializers.SerializerMethodField()
    assignment_count = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = (
            'id', 'title', 'slug', 'lesson_type',
            'description', 'content', 'video_url', 'audio_url',
            'estimated_minutes', 'xp_reward', 'order',
            'is_premium',
            'track', 'cefr_level',
            'module_title', 'course_title',
            'word_count', 'grammar_topic_count',
            'quiz_count', 'assignment_count',
        )

    def get_word_count(self, obj):
        return obj.lesson_words.count()

    def get_grammar_topic_count(self, obj):
        return obj.lesson_grammar.count()

    def get_quiz_count(self, obj):
        return obj.quizzes.filter(is_published=True).count()

    def get_assignment_count(self, obj):
        return obj.assignments.filter(is_published=True).count()


class ModuleListSerializer(serializers.ModelSerializer):
    """Course ichidagi modullar uchun (lessons sonini ham beradi)."""
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = (
            'id', 'title', 'slug', 'description',
            'order', 'lesson_count',
        )

    def get_lesson_count(self, obj):
        return obj.lessons.filter(is_published=True).count()


class ModuleDetailSerializer(serializers.ModelSerializer):
    """Module + ichidagi lesson ro'yxati."""
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = (
            'id', 'title', 'slug', 'description',
            'order', 'lessons',
        )

    def get_lessons(self, obj):
        published = obj.lessons.filter(is_published=True).order_by('order')
        return LessonListSerializer(published, many=True).data


class CourseListSerializer(serializers.ModelSerializer):
    """Track sahifasidagi course gridlar uchun."""
    module_count = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'slug', 'description',
            'track', 'cefr_level', 'ielts_skill',
            'icon', 'color', 'cover_image',
            'order', 'module_count', 'lesson_count',
        )

    def get_module_count(self, obj):
        return obj.modules.filter(is_published=True).count()

    def get_lesson_count(self, obj):
        return Lesson.objects.filter(
            module__course=obj,
            module__is_published=True,
            is_published=True,
        ).count()


class CourseDetailSerializer(serializers.ModelSerializer):
    """Course sahifasi — barcha modullarni ichida."""
    modules = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'slug', 'description',
            'track', 'cefr_level', 'ielts_skill',
            'icon', 'color', 'cover_image',
            'modules',
        )

    def get_modules(self, obj):
        published = obj.modules.filter(is_published=True).order_by('order')
        return ModuleListSerializer(published, many=True).data