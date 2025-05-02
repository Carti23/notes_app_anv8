"""
Tests for note sharing functionality.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from notes.models import Note


@pytest.mark.django_db
class TestNoteSharing:
    """
    Test suite for note sharing functionality.
    """
    
    def test_share_note(self, authenticated_client, test_user, test_user2):
        """
        Test sharing a note with another user.
        """
        note = Note.objects.create(
            owner=test_user,
            title='Shared Note',
            content='Shared Content'
        )
        
        url = reverse('note-share', kwargs={'pk': note.pk})
        data = {'user_id': test_user2.id}
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert test_user2 in note.shared_with.all()
    
    def test_share_note_with_self(self, authenticated_client, test_user):
        """
        Test attempting to share a note with oneself.
        """
        note = Note.objects.create(
            owner=test_user,
            title='Test Note',
            content='Test Content'
        )
        
        url = reverse('note-share', kwargs={'pk': note.pk})
        data = {'user_id': test_user.id}
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_share_note_with_nonexistent_user(self, authenticated_client, test_user):
        """
        Test attempting to share a note with a non-existent user.
        """
        note = Note.objects.create(
            owner=test_user,
            title='Test Note',
            content='Test Content'
        )
        
        url = reverse('note-share', kwargs={'pk': note.pk})
        data = {'user_id': 99999}  # Non-existent user ID
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'detail' in response.data
        assert response.data['detail'] == 'User not found.'
    
    def test_unshare_note(self, authenticated_client, test_user, test_user2):
        """
        Test unsharing a note from a user.
        """
        note = Note.objects.create(
            owner=test_user,
            title='Shared Note',
            content='Shared Content'
        )
        note.shared_with.add(test_user2)
        
        url = reverse('note-unshare', kwargs={'pk': note.pk})
        data = {'user_id': test_user2.id}
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert test_user2 not in note.shared_with.all()
    
    def test_access_shared_note(self, api_client, test_user, test_user2):
        """
        Test accessing a note that has been shared with the user.
        """
        note = Note.objects.create(
            owner=test_user,
            title='Shared Note',
            content='Shared Content'
        )
        note.shared_with.add(test_user2)
        
        # Create a new client authenticated as test_user2
        refresh = RefreshToken.for_user(test_user2)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('note-detail', kwargs={'pk': note.pk})
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Shared Note'
    
    def test_list_shared_notes(self, api_client, test_user, test_user2):
        """
        Test listing notes that have been shared with the user.
        """
        # Create notes owned by test_user
        Note.objects.create(
            owner=test_user,
            title='Shared Note 1',
            content='Content 1'
        )
        note2 = Note.objects.create(
            owner=test_user,
            title='Shared Note 2',
            content='Content 2'
        )
        note2.shared_with.add(test_user2)
        
        # Create a new client authenticated as test_user2
        refresh = RefreshToken.for_user(test_user2)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('note-shared')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['title'] == 'Shared Note 2' 