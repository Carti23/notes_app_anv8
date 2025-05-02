"""
Tests for authentication endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
class TestAuthEndpoints:
    """
    Test suite for authentication endpoints.
    """
    
    def test_register_success(self, api_client):
        """
        Test successful user registration.
        """
        url = reverse('auth-register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'token' in response.data
        assert response.data['msg'] == 'Registration successful.'
    
    def test_register_duplicate_email(self, api_client, test_user):
        """
        Test registration with duplicate email.
        """
        url = reverse('auth-register')
        data = {
            'username': 'newuser',
            'email': test_user.email,  # Using existing user's email
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        # Check if the error message contains the email error
        assert 'email' in str(response.data['message'])
    
    def test_login_success(self, api_client, test_user):
        """
        Test successful login.
        """
        url = reverse('auth-login')
        data = {
            'email': test_user.email,
            'password': 'testpass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'token' in response.data
        assert response.data['msg'] == 'Login successful'
    
    def test_login_invalid_credentials(self, api_client):
        """
        Test login with invalid credentials.
        """
        url = reverse('auth-login')
        data = {
            'email': 'wrong@example.com',
            'password': 'wrongpass'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'non_field_errors' in response.data['errors']
    
    
    def test_logout_no_token(self, authenticated_client):
        """
        Test logout without providing a token.
        """
        url = reverse('auth-logout')
        data = {}
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'refresh' in response.data['errors'] 