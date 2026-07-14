"""Test uchun yengil sozlamalar — SQLite, tez parol hasher, sync Celery."""

import os

# CI va lokal testda .env bo'lmasa ham settings import qilinsin
os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-pytest')
os.environ.setdefault('TEACHER_INVITE_CODE', 'teacher-invite-test')
os.environ.setdefault('DB_NAME', 'test')
os.environ.setdefault('DB_USER', 'test')
os.environ.setdefault('DB_PASSWORD', 'test')

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
