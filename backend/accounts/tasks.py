from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_password_reset_email(email, full_name, reset_url):
    subject = "Parolni tiklash — English with Diyora"
    message = f"""Salom {full_name or ''},

Parolingizni tiklash uchun so'rov yubordingiz. Quyidagi havola orqali yangi parol o'rnatishingiz mumkin (havola 1 soat amal qiladi):

{reset_url}

Agar siz bu so'rovni yubormagan bo'lsangiz, shu xabarni e'tiborsiz qoldiring.

English with Diyora jamoasi
"""
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )