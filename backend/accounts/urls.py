from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import AuthViewSet, ContactViewSet, UserViewSet

# Create a router for viewsets
router = DefaultRouter()
router.register(r"auth", AuthViewSet, basename="auth")
router.register(r"users", UserViewSet, basename="user")
router.register(r"contacts", ContactViewSet, basename="contact")

# Additional JWT authentication routes
extra_auth_patterns = [
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# Combined URL patterns
urlpatterns = [
    # ViewSet routing - includes auth endpoints
    path("", include(router.urls)),
    # Additional authentication endpoints
    path("auth/", include(extra_auth_patterns)),
]
