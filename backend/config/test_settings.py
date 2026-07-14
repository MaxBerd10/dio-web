"""Test uchun yengil sozlamalar — SQLite, tez parol hasher, sync Celery."""

from decouple import config

from .settings import *  # noqa: F403, F401

SECRET_KEY = config('SECRET_KEY', default='test-secret-key-for-pytest')
DEBUG = True
TEACHER_INVITE_CODE = config('TEACHER_INVITE_CODE', default='teacher-invite-test')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
