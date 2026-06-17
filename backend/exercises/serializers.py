from rest_framework import serializers
from .models import (
    Quiz, Question, Choice,
    Assignment, AssignmentSubmission, FeedbackComment,
)


# ============================================================
# Quiz serializers
# ============================================================

class ChoiceSerializer(serializers.ModelSerializer):
    """Variantlar — is_correct yashirin (savol yechilayotganda)."""
    class Meta:
        model = Choice
        fields = ('id', 'text', 'match_pair', 'order')


class ChoiceWithAnswerSerializer(serializers.ModelSerializer):
    """Tugagandan keyin to'g'ri javoblarni ko'rsatish uchun."""
    class Meta:
        model = Choice
        fields = ('id', 'text', 'is_correct', 'match_pair', 'order')


class QuestionForAttemptSerializer(serializers.ModelSerializer):
    """Quiz boshlanganda savollar — to'g'ri javobsiz."""
    choices = ChoiceSerializer(many=True, read_only=True)
    question_type_display = serializers.CharField(
        source='get_question_type_display', read_only=True,
    )

    class Meta:
        model = Question
        fields = (
            'id', 'question_type', 'question_type_display',
            'text', 'image', 'audio_url',
            'points', 'order', 'choices',
        )


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Tugagandan keyin — to'g'ri javob va tushuntirish bilan."""
    choices = ChoiceWithAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = (
            'id', 'question_type', 'text', 'image', 'audio_url',
            'correct_answer_text', 'explanation',
            'points', 'order', 'choices',
        )

class QuizListSerializer(serializers.ModelSerializer):
    """Lesson sahifasida quiz ro'yxati uchun."""
    question_count = serializers.SerializerMethodField()
    user_attempts = serializers.SerializerMethodField()
    best_score = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = (
            'id', 'title', 'description',
            'passing_score', 'time_limit_seconds', 'max_attempts',
            'xp_reward', 'order',
            'question_count', 'user_attempts', 'best_score',
        )

    def get_user_attempts(self, obj):
        user = self.context.get('request').user
        if not user or not user.is_authenticated:
            return 0
        from progress.models import QuizAttempt
        return QuizAttempt.objects.filter(student=user, quiz=obj).count()

    def get_question_count(self, obj):
        return obj.question_count


    def get_best_score(self, obj):
        user = self.context.get('request').user
        if not user or not user.is_authenticated:
            return None
        from progress.models import QuizAttempt
        best = (
            QuizAttempt.objects
            .filter(student=user, quiz=obj, status='completed')
            .order_by('-percentage')
            .first()
        )
        return float(best.percentage) if best else None

class QuizDetailSerializer(serializers.ModelSerializer):
    """Quiz boshlanishidan oldin to'liq ma'lumot."""
    questions = QuestionForAttemptSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    def get_question_count(self, obj):
        return obj.question_count

    class Meta:
        model = Quiz
        fields = (
            'id', 'title', 'description',
            'passing_score', 'time_limit_seconds', 'max_attempts',
            'xp_reward', 'shuffle_questions',
            'question_count', 'questions',
        )


# ============================================================
# Answer submission
# ============================================================

class AnswerSubmitSerializer(serializers.Serializer):
    """Yagona savol javobi (oraliq saqlash uchun)."""
    question_id = serializers.IntegerField()
    selected_choice_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, default=list,
    )
    text_answer = serializers.CharField(
        required=False, allow_blank=True, default='',
    )
    time_spent_seconds = serializers.IntegerField(required=False, default=0)


# ============================================================
# Assignment serializers
# ============================================================

class AssignmentSerializer(serializers.ModelSerializer):
    """Yagona assignment ma'lumoti."""
    assignment_type_display = serializers.CharField(
        source='get_assignment_type_display', read_only=True,
    )
    user_submission = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = (
            'id', 'title', 'assignment_type', 'assignment_type_display',
            'instructions', 'rubric',
            'min_words', 'max_words', 'time_limit_minutes',
            'xp_reward', 'order',
            'user_submission',
        )

    def get_user_submission(self, obj):
        user = self.context.get('request').user
        if not user or not user.is_authenticated or user.role != 'student':
            return None
        submission = (
            AssignmentSubmission.objects
            .filter(assignment=obj, student=user)
            .order_by('-created_at')
            .first()
        )
        if not submission:
            return None
        return {
            'id': submission.id,
            'status': submission.status,
            'score': float(submission.score) if submission.score else None,
            'submitted_at': submission.submitted_at,
        }


class FeedbackCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source='author.full_name', read_only=True,
    )
    category_display = serializers.CharField(
        source='get_category_display', read_only=True,
    )

    class Meta:
        model = FeedbackComment
        fields = (
            'id', 'author', 'author_name',
            'quoted_text', 'start_offset', 'end_offset',
            'comment', 'category', 'category_display',
            'created_at',
        )
        read_only_fields = ('id', 'author', 'created_at')


class SubmissionListSerializer(serializers.ModelSerializer):
    """Submission ro'yxati uchun — qisqa."""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = (
            'id', 'student', 'student_name', 'student_username',
            'assignment', 'assignment_title',
            'status', 'status_display',
            'score', 'word_count', 'submitted_at',
        )


class SubmissionDetailSerializer(serializers.ModelSerializer):
    """Submission to'liq detail — student ham, teacher ham ko'radi."""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True)
    comments = FeedbackCommentSerializer(many=True, read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = (
            'id', 'assignment', 'assignment_title',
            'student', 'student_name', 'student_username',
            'content', 'audio_file', 'attachment', 'word_count',
            'status',
            'submitted_at', 'reviewed_at',
            'reviewer', 'reviewer_name',
            'score', 'feedback', 'strengths', 'improvements',
            'comments',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'student', 'word_count', 'submitted_at',
            'reviewed_at', 'reviewer',
            'created_at', 'updated_at',
        )


class SubmissionSubmitSerializer(serializers.ModelSerializer):
    """Student vazifani topshirayotganda."""
    class Meta:
        model = AssignmentSubmission
        fields = ('content', 'audio_file', 'attachment')


class SubmissionGradeSerializer(serializers.ModelSerializer):
    """Teacher baho berayotganda."""
    class Meta:
        model = AssignmentSubmission
        fields = ('score', 'feedback', 'strengths', 'improvements', 'status')