class UserNotFoundError(Exception):
    """Raised when a user cannot be found."""

    pass


class InvalidCredentialsError(Exception):
    """Raised when user credentials are invalid."""

    pass
