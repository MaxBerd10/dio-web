from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """O'quvchi yoki ustoz ro'yxatdan o'tishi uchun."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        min_length=8,
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'username',
            'full_name',
            'password',
            'password_confirm',
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

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': "Parollar mos kelmadi."}
            )

        # Admin role'ini API orqali yaratishga ruxsat berilmaydi
        role = attrs.get('role', User.Role.STUDENT)
        if role == User.Role.ADMIN:
            raise serializers.ValidationError(
                {'role': "Admin role'ini ro'yxatdan o'tish orqali yaratib bo'lmaydi."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
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