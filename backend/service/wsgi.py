"""
WSGI config for service project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service.settings.local')

# Override with environment-specific settings if specified
if os.getenv('DJANGO_ENV') == 'production':
    os.environ['DJANGO_SETTINGS_MODULE'] = 'service.settings.prod'
elif os.getenv('DJANGO_ENV') == 'development':
    os.environ['DJANGO_SETTINGS_MODULE'] = 'service.settings.dev'

application = get_wsgi_application()
