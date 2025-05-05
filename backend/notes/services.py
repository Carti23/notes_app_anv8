from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import models

from .exceptions import NoteSharingError, UserNotFoundError
from .models import Note, NoteHistory

User = get_user_model()


class NoteService:
    @staticmethod
    def get_user_notes(user):
        """Get all notes for a user (owned and shared)."""
        cache_key = f"user_notes_{user.id}"
        notes = cache.get(cache_key)

        if notes is None:
            notes = Note.objects.filter(
                models.Q(owner=user) | models.Q(shared_with=user)
            ).distinct()
            cache.set(cache_key, notes, timeout=300)  # Cache for 5 minutes

        return notes

    @staticmethod
    def create_note(user, title, content):
        """Create a new note with history tracking."""
        note = Note.objects.create(
            owner=user, title=title, content=content, last_edited_by=user
        )

        NoteHistory.objects.create(note=note, content=content, edited_by=user)

        return note

    @staticmethod
    def update_note(note, content, title=None, user=None):
        """Update a note with history tracking."""
        old_content = note.content
        note.content = content
        if title is not None:
            note.title = title
        if user is not None:
            note.last_edited_by = user
        note.save()

        if old_content != content:
            NoteHistory.objects.create(note=note, content=content, edited_by=user)

        return note

    @staticmethod
    def share_note(note, owner, user_id):
        """Share a note with another user."""
        if note.owner != owner:
            raise NoteSharingError("Only the owner can share this note.")

        try:
            user_to_share = User.objects.get(id=user_id)
            if note.share_with_user(user_to_share):
                return True
            raise NoteSharingError("Cannot share note with this user.")
        except User.DoesNotExist:
            raise UserNotFoundError("User not found.")

    @staticmethod
    def unshare_note(note, owner, user_id):
        """Remove sharing access for a user."""
        if note.owner != owner:
            raise NoteSharingError("Only the owner can modify sharing settings.")

        try:
            user_to_unshare = User.objects.get(id=user_id)
            if note.unshare_with_user(user_to_unshare):
                return True
            raise NoteSharingError("Note is not shared with this user.")
        except User.DoesNotExist:
            raise UserNotFoundError("User not found.")

    @staticmethod
    def get_note_history(note):
        """Get the edit history of a note."""
        return note.history.all()

    @staticmethod
    def get_personal_notes(user):
        """Get notes owned by the user."""
        return Note.objects.filter(owner=user)

    @staticmethod
    def get_shared_notes(user):
        """Get notes shared with the user."""
        return user.shared_notes.all()
