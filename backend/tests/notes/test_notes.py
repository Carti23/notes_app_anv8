"""
Tests for note CRUD operations.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from notes.models import Note


@pytest.mark.django_db
class TestNoteEndpoints:
    """
    Test suite for note endpoints.
    """
    
    def test_create_note(self, authenticated_client):
        """
        Test creating a new note.
        """
        url = reverse('note-list')
        data = {
            'title': 'Test Note',
            'content': 'This is a test note content.'
        }
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'Test Note'
        assert response.data['content'] == 'This is a test note content.'
        assert Note.objects.count() == 1
    
    def test_list_notes(self, authenticated_client, test_user):
        """
        Test listing user's notes.
        """
        # Create some test notes
        Note.objects.create(
            owner=test_user,
            title='Note 1',
            content='Content 1'
        )
        Note.objects.create(
            owner=test_user,
            title='Note 2',
            content='Content 2'
        )
        
        url = reverse('note-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_get_note_detail(self, authenticated_client, test_user):
        """
        Test retrieving a specific note.
        """
        note = Note.objects.create(
            owner=test_user,
            title='Test Note',
            content='Test Content'
        )
        
        url = reverse('note-detail', kwargs={'pk': note.pk})
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Test Note'
        assert response.data['content'] == 'Test Content'
    
    def test_update_note(self, authenticated_client, test_user):
        """
        Test updating a note.
        """
        note = Note.objects.create(
            owner=test_user,
            title='Original Title',
            content='Original Content'
        )
        
        url = reverse('note-detail', kwargs={'pk': note.pk})
        data = {
            'title': 'Updated Title',
            'content': 'Updated Content'
        }
        
        response = authenticated_client.put(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Title'
        assert response.data['content'] == 'Updated Content'
        
        # Check that history was created
        assert note.history.count() == 1
    
    def test_delete_note(self, authenticated_client, test_user):
        """
        Test deleting a note.
        """
        note = Note.objects.create(
            owner=test_user,
            title='Test Note',
            content='Test Content'
        )
        
        url = reverse('note-detail', kwargs={'pk': note.pk})
        response = authenticated_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Note.objects.count() == 0
    
    def test_unauthorized_access(self, api_client, test_user):
        """
        Test unauthorized access to notes.
        """
        note = Note.objects.create(
            owner=test_user,
            title='Test Note',
            content='Test Content'
        )
        
        url = reverse('note-detail', kwargs={'pk': note.pk})
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_access_other_user_note(self, authenticated_client, test_user2):
        """
        Test accessing another user's note.
        """
        note = Note.objects.create(
            owner=test_user2,
            title='Other User Note',
            content='Other User Content'
        )
        
        url = reverse('note-detail', kwargs={'pk': note.pk})
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND 