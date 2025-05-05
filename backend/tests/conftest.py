"""
Common test fixtures for the notes-app backend.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture
def api_client():
    """
    Return an API client for testing.
    """
    return APIClient()


@pytest.fixture
def test_user():
    """
    Create and return a test user.
    """
    user = User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
        is_verified=True,
    )
    return user


@pytest.fixture
def authenticated_client(api_client, test_user):
    """
    Return an authenticated API client.
    """
    refresh = RefreshToken.for_user(test_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def test_user2():
    """
    Create and return a second test user.
    """
    user = User.objects.create_user(
        username="testuser2",
        email="test2@example.com",
        password="testpass123",
        is_verified=True,
    )
    return user


@pytest.fixture
def authenticated_client2(api_client, test_user2):
    """
    Return a second authenticated API client.
    """
    refresh = RefreshToken.for_user(test_user2)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client
