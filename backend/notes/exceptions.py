class NoteSharingError(Exception):
    """Raised when there's an error with note sharing operations."""
    pass

class UserNotFoundError(Exception):
    """Raised when a user is not found."""
    pass

class NoteValidationError(Exception):
    """Raised when note validation fails."""
    pass 