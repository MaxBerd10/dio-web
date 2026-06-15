from rest_framework import serializers
from .models import (
    LessonProgress, WordProgress,
    QuizAttempt, QuestionResponse,
    Streak, UserXP,
    Achievement, UserAchievement,
)


# ============================================================
# Vocabulary SRS (avvaldan mavjud)
# ============================================================

class WordProgressSerializer(serializers.ModelSerializer):
    word_text = serializers.CharField(source='word.word', read_only=True)
    word_translation = serializers.CharField(
        source='word.translation_uz', read_only=True,
    )

    class Meta:
        model = WordProgress
        fields = (
            'id', 'word', 'word_text', 'word_translation',
            'status', 'ease_factor', 'interval_days',
            'repetitions', 'next_review_at', 'last_reviewed_at',
            'total_reviews', 'correct_reviews', 'lapses',
        )
        read_only_fields = fields


class ReviewSubmitSerializer(serializers.Serializer):
    word_id = serializers.IntegerField()
    quality = serializers.IntegerField(min_value=0, max_value=5)


# ============================================================
# Lesson progress
# ============================================================

class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_slug = serializers.CharField(source='lesson.slug', read_only=True)
    module_title = serializers.CharField(source='lesson.module.title', read_only=True)
    course_title = serializers.CharField(source='lesson.module.course.title', read_only=True)
    track = serializers.CharField(source='lesson.module.course.track', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = LessonProgress
        fields = (
            'id', 'lesson', 'lesson_title', 'lesson_slug',
            'module_title', 'course_title', 'track',
            'status', 'status_display',
            'completion_percentage', 'xp_earned',
            'started_at', 'completed_at', 'time_spent_seconds',
            'updated_at',
        )


class LessonProgressUpdateSerializer(serializers.Serializer):
    """Lesson holatini yangilash (started / completed)."""
    action = serializers.ChoiceField(choices=['start', 'complete'])


# ============================================================
# Quiz attempt
# ============================================================

class QuizAttemptListSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    lesson_title = serializers.CharField(source='quiz.lesson.title', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = (
            'id', 'quiz', 'quiz_title', 'lesson_title',
            'status', 'score', 'max_score', 'percentage', 'passed',
            'xp_earned', 'time_spent_seconds',
            'started_at', 'completed_at',
        )


# ============================================================
# Streak
# ============================================================

class StreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streak
        fields = (
            'current_streak', 'longest_streak',
            'last_activity_date', 'streak_started_date',
            'freeze_count', 'updated_at',
        )


# ============================================================
# XP & Level
# ============================================================

class UserXPSerializer(serializers.ModelSerializer):
    next_level_xp = serializers.SerializerMethodField()
    progress_to_next_level = serializers.SerializerMethodField()

    class Meta:
        model = UserXP
        fields = (
            'total_xp', 'level',
            'daily_xp', 'weekly_xp',
            'next_level_xp', 'progress_to_next_level',
            'last_xp_earned_at', 'updated_at',
        )

    def get_next_level_xp(self, obj):
        """Keyingi darajaga o'tish uchun jami kerakli XP."""
        return sum(obj.xp_for_level(l) for l in range(1, obj.level + 1))

    def get_progress_to_next_level(self, obj):
        """0-100% — joriy daraja ichidagi taraqqiyot."""
        prev = sum(obj.xp_for_level(l) for l in range(1, obj.level))
        nxt = sum(obj.xp_for_level(l) for l in range(1, obj.level + 1))
        if nxt == prev:
            return 0
        return round((obj.total_xp - prev) / (nxt - prev) * 100, 1)


# ============================================================
# Achievements
# ============================================================

class AchievementSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source='get_category_display', read_only=True,
    )
    is_earned = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = (
            'id', 'code', 'title', 'description',
            'category', 'category_display',
            'icon', 'image', 'target_value', 'xp_reward',
            'is_earned',
        )

    def get_is_earned(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return False
        return UserAchievement.objects.filter(
            student=user, achievement=obj,
        ).exists()


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ('id', 'achievement', 'earned_at')


# ============================================================
# Leaderboard
# ============================================================

class LeaderboardEntrySerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    avatar = serializers.URLField(allow_null=True)
    level = serializers.IntegerField()
    xp = serializers.IntegerField()
    current_streak = serializers.IntegerField()


# ============================================================
# Dashboard summary
# ============================================================

class DashboardSummarySerializer(serializers.Serializer):
    streak = StreakSerializer()
    xp = UserXPSerializer()

    # Quick stats
    words_total = serializers.IntegerField()
    words_due_now = serializers.IntegerField()
    words_mastered = serializers.IntegerField()

    lessons_completed = serializers.IntegerField()
    lessons_in_progress = serializers.IntegerField()

    quizzes_passed = serializers.IntegerField()

    achievements_earned = serializers.IntegerField()
    achievements_total = serializers.IntegerField()

    # Joriy oy
    daily_goal_xp = serializers.IntegerField()
    daily_goal_met = serializers.BooleanField()