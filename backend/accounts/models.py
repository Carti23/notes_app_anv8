from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
import uuid


class User(AbstractUser):
    """
    Extended User model with additional fields for the application.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    bio = models.TextField(max_length=500, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)
    contacts = models.ManyToManyField(
        'self', 
        through='UserContact',
        symmetrical=False, 
        related_name='user_contacts'
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        
    def __str__(self):
        """Return a string representation of the user."""
        return self.email
    
    def get_full_name(self):
        """Return the user's full name or username if name is not set."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def get_shared_notes(self):
        """Returns all notes shared with this user."""
        return self.shared_notes.all()
    
    def get_owned_notes(self):
        """Returns all notes owned by this user."""
        return self.owned_notes.all()
    
    def get_contacts(self):
        """Returns all contacts for this user."""
        return User.objects.filter(
            contact_relationships__user=self
        )


class UserContact(models.Model):
    """
    Model to represent relationships between users for note sharing.
    """
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='user_relationships'
    )
    contact = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='contact_relationships'
    )
    nickname = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'contact')
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.username} → {self.contact.username}"