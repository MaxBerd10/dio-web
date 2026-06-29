from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """O'quvchi yoki ustoz ro'yxatdan o'tishi uchun."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    invite_code = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Faqat 'teacher' roli uchun kerak.",
    )

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'username',
            'full_name',
            'password',
            'password_confirm',
            'invite_code',
            'role',
            'cefr_level',
            'learning_goal',
            'target_ielts_score',
        )
        extra_kwargs = {
            'role': {'required': False},  # default = student
            'cefr_level': {'required': False},
            'learning_goal': {'required': False},
            'target_ielts_score': {'required': False},
        }

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            translated = []
            for msg in e.messages:
                if 'too common' in msg:
                    translated.append("Bu parol juda oddiy/keng tarqalgan. Boshqa, original parol tanlang.")
                elif 'too similar' in msg:
                    translated.append("Parol ismingiz yoki emailingizga juda o'xshash. Boshqa parol tanlang.")
                elif 'entirely numeric' in msg:
                    translated.append("Parol faqat raqamlardan iborat bo'lmasligi kerak.")
                elif 'too short' in msg:
                    translated.append("Parol juda qisqa.")
                else:
                    translated.append("Parol talablarga javob bermaydi. Boshqa parol tanlang.")
            raise serializers.ValidationError(translated)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': "Parollar mos kelmadi."}
            )

        role = attrs.get('role', User.Role.STUDENT)

        # Admin role'ini API orqali yaratishga ruxsat berilmaydi
        if role == User.Role.ADMIN:
            raise serializers.ValidationError(
                {'role': "Admin role'ini ro'yxatdan o'tish orqali yaratib bo'lmaydi."}
            )

        # Teacher uchun invite code tekshiruvi
        if role == User.Role.TEACHER:
            invite_code = attrs.get('invite_code', '')
            expected_code = settings.TEACHER_INVITE_CODE
            if not expected_code or invite_code != expected_code:
                raise serializers.ValidationError(
                    {'invite_code': "Noto'g'ri yoki bo'sh invite kod."}
                )

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data.pop('invite_code', None)  # model maydoni emas, saqlanmaydi
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Joriy user profili (GET /me uchun)."""

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'username',
            'full_name',
            'avatar',
            'bio',
            'phone',
            'role',
            'cefr_level',
            'learning_goal',
            'target_ielts_score',
            'is_verified',
            'created_at',
        )
        read_only_fields = ('id', 'email', 'role', 'is_verified', 'created_at')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT token ichiga user ma'lumotini ham qo'shamiz (frontend uchun qulay)."""

    username_field = 'email'  # email bilan login

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data