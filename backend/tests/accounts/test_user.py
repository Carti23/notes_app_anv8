"""
Tests for user profile endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestUserEndpoints:
    """
    Test suite for user profile endpoints.
    """
    
    def test_get_profile(self, authenticated_client, test_user):
        """
        Test retrieving user profile.
        """
        url = reverse('user-me')
        
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == test_user.email
        assert response.data['username'] == test_user.username
    
    def test_update_profile(self, authenticated_client, test_user):
        """
        Test updating user profile.
        """
        url = reverse('user-me')
        data = {
            'username': 'updated_username',
            'first_name': 'Updated',
            'last_name': 'User'
        }
        
        response = authenticated_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == 'updated_username'
        assert response.data['first_name'] == 'Updated'
        assert response.data['last_name'] == 'User'
    
    def test_search_users(self, authenticated_client, test_user2):
        """
        Test searching for users.
        """
        url = reverse('user-search')
        params = {'query': 'testuser2'}
        
        response = authenticated_client.get(url, params)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0
        assert response.data[0]['email'] == test_user2.email
    
    def test_find_user_by_email(self, authenticated_client, test_user2):
        """
        Test finding a user by exact email.
        """
        url = reverse('user-find')
        params = {'email': test_user2.email}
        
        response = authenticated_client.get(url, params)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == test_user2.email
    
    def test_find_user_by_email_not_found(self, authenticated_client):
        """
        Test finding a user by non-existent email.
        """
        url = reverse('user-find')
        params = {'email': 'nonexistent@example.com'}
        
        response = authenticated_client.get(url, params)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert 'error' in response.data 