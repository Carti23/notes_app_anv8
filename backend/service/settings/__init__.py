"""
Settings package for the service project.
"""

# Import the appropriate settings based on the environment
import os

# Default to local settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "service.settings.local")

# Override with environment-specific settings if specified
if os.getenv("DJANGO_ENV") == "production":
    os.environ["DJANGO_SETTINGS_MODULE"] = "service.settings.prod"
elif os.getenv("DJANGO_ENV") == "development":
    os.environ["DJANGO_SETTINGS_MODULE"] = "service.settings.dev"
