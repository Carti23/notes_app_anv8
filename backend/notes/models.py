from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Note(models.Model):
    """
    Model representing a note in the application.
    Includes sharing functionality and real-time update tracking.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='owned_notes',
        help_text="User who created and owns this note"
    )
    shared_with = models.ManyToManyField(
        User, 
        related_name='shared_notes',
        blank=True,
        help_text="Users who can view and edit this note"
    )
    is_archived = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_edited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='last_edited_notes',
        null=True,
        blank=True
    )
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Note'
        verbose_name_plural = 'Notes'
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['updated_at']),
            models.Index(fields=['is_pinned']),
        ]
    
    def __str__(self):
        """Return a string representation of the note."""
        return f"{self.title} ({self.owner.username})"
    
    def get_shared_users(self):
        """Returns a list of users this note is shared with."""
        return self.shared_with.all()
    
    def share_with_user(self, user):
        """
        Share this note with a user.
        
        Args:
            user: User to share the note with
            
        Returns:
            Boolean indicating success or failure
        """
        if user != self.owner and user not in self.shared_with.all():
            self.shared_with.add(user)
            return True
        return False
    
    def unshare_with_user(self, user):
        """
        Unshare this note with a user.
        
        Args:
            user: User to remove sharing access for
            
        Returns:
            Boolean indicating success or failure
        """
        if user in self.shared_with.all():
            self.shared_with.remove(user)
            return True
        return False
    
    def create_history_entry(self, edited_by):
        """
        Create a history entry for the current state of the note.
        
        Args:
            edited_by: User who made the edit
            
        Returns:
            NoteHistory instance
        """
        return NoteHistory.objects.create(
            note=self,
            content=self.content,
            edited_by=edited_by
        )


class NoteHistory(models.Model):
    """
    Model to track changes to notes for versioning and audit purposes.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    note = models.ForeignKey(
        Note, 
        on_delete=models.CASCADE, 
        related_name='history'
    )
    content = models.TextField()
    edited_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        related_name='note_edits',
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Note History'
        verbose_name_plural = 'Note Histories'
        indexes = [
            models.Index(fields=['note']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        """Return a string representation of the note history entry."""
        return f"Edit of {self.note.title} at {self.created_at}"