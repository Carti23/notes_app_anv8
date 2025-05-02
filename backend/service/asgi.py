"""
ASGI config for service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service.settings.local')

# Override with environment-specific settings if specified
if os.getenv('DJANGO_ENV') == 'production':
    os.environ['DJANGO_SETTINGS_MODULE'] = 'service.settings.prod'
elif os.getenv('DJANGO_ENV') == 'development':
    os.environ['DJANGO_SETTINGS_MODULE'] = 'service.settings.dev'

application = get_asgi_application()
