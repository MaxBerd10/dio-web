from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Avtomatik JWT chiqaramiz — registratsiyadan keyin darrov kira oladi
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['full_name'] = user.full_name

        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/"""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class LogoutView(APIView):
    """POST /api/auth/logout/ — refresh tokenni blacklist'ga qo'shadi."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'detail': 'Refresh token kerak.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'detail': "Tizimdan muvaffaqiyatli chiqildi."},
                status=status.HTTP_205_RESET_CONTENT,
            )
        except Exception as e:
            return Response(
                {'detail': f'Xato: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ — joriy user profili."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    """
    POST /api/auth/password-reset/
    body: {"email": "..."}
    """
    permission_classes = [AllowAny]

    def post(self, request):
        from .models import PasswordResetToken
        from .tasks import send_password_reset_email

        email = request.data.get('email', '').strip().lower()
        user = User.objects.filter(email__iexact=email).first()

        # Xavfsizlik: email mavjud bo'lmasa ham bir xil javob qaytaramiz
        if user:
            reset_token = PasswordResetToken.objects.create(user=user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token.token}"
            send_password_reset_email.delay(user.email, user.full_name, reset_url)

        return Response({
            'detail': "Agar shu email bilan hisob mavjud bo'lsa, parolni tiklash havolasi yuborildi.",
        })


class PasswordResetConfirmView(APIView):
    """
    POST /api/auth/password-reset/confirm/
    body: {"token": "...", "new_password": "..."}
    """
    permission_classes = [AllowAny]

    def post(self, request):
        from .models import PasswordResetToken

        token_str = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if len(new_password) < 8:
            return Response(
                {'detail': "Parol kamida 8 ta belgidan iborat bo'lishi kerak."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reset_token = PasswordResetToken.objects.filter(token=token_str).first()
        if not reset_token or not reset_token.is_valid:
            return Response(
                {'detail': "Havola yaroqsiz yoki muddati o'tgan. Qaytadan so'rang."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = reset_token.user
        user.set_password(new_password)
        user.save()

        reset_token.used = True
        reset_token.save(update_fields=['used'])

        return Response({'detail': 'Parol muvaffaqiyatli yangilandi.'})