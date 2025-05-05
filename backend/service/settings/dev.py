"""
Development settings for service project.
"""


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-^n81=$zu^k-$!1q1wve$_k%)&hrkp8or^4z8ds$lmqnxy-z-q8"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["54.208.181.106", "localhost"]

# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "notes_app",
        "USER": "admin",
        "PASSWORD": "password",
        "HOST": "localhost",
        "PORT": "",
    }
}

# Cache settings
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://localhost:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "CONNECTION_POOL_KWARGS": {
                "max_connections": 100,
            },
            "SOCKET_CONNECT_TIMEOUT": 20,
            "SOCKET_TIMEOUT": 20,
            "COMPRESSOR_CLASS": "django_redis.compressors.zlib.ZlibCompressor",
        },
    }
}

# CORS settings
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Email settings
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "noreply@example.com"

# Frontend URL for email confirmation
FRONTEND_URL = "http://localhost:3000"
