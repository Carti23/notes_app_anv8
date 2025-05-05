import logging
from typing import Any, Dict, Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import transaction
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .exceptions import InvalidCredentialsError, UserNotFoundError
from .models import User

logger = logging.getLogger(__name__)
User = get_user_model()


class UserService:
    @staticmethod
    def get_user_by_id(user_id: int) -> User:
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise UserNotFoundError(f"User with id {user_id} not found")

    @staticmethod
    def get_user_by_email(email: str) -> User:
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            raise UserNotFoundError(f"User with email {email} not found")

    @staticmethod
    def authenticate_user(email: str, password: str) -> User:
        try:
            user = UserService.get_user_by_email(email)
            if user.check_password(password):
                return user
            raise InvalidCredentialsError("Invalid password")
        except UserNotFoundError:
            raise InvalidCredentialsError("Invalid email")

    @staticmethod
    def create_user(username: str, email: str, password: str) -> User:
        return User.objects.create_user(
            username=username, email=email, password=password
        )

    @staticmethod
    def update_user(user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            setattr(user, key, value)
        user.save()
        return user

    @staticmethod
    def delete_user(user: User) -> None:
        user.delete()


def get_tokens_for_user(user: User) -> Dict[str, str]:
    """
    Generate JWT tokens for a user.

    Args:
        user: User instance to generate tokens for

    Returns:
        Dict containing access and refresh tokens
    """
    try:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Log token generation with limited token info for security
        logger.info(f"Generated tokens for user: {user.email}")

        return {
            "refresh": refresh_token,
            "access": access_token,
        }
    except Exception as e:
        logger.error(f"Failed to generate tokens for user {user.email}: {str(e)}")
        raise


def send_confirmation_email(user: User) -> bool:
    """
    Send email confirmation link to user.

    Args:
        user: User to send confirmation email to

    Returns:
        Boolean indicating success or failure
    """
    try:
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        confirmation_link = f"{settings.FRONTEND_URL}/confirm-email/{uid}/{token}/"

        subject = "Email Confirmation"
        message = (
            f"Hello {user.get_full_name() or user.username},\n\n"
            f"Please confirm your email by clicking the link below:\n{confirmation_link}\n\n"
            "Thank you!"
        )

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        logger.info(f"Confirmation email sent to {user.email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send confirmation email to {user.email}: {str(e)}")
        return False


def blacklist_token(token: str) -> bool:
    """
    Blacklist a refresh token to invalidate it.

    Args:
        token: JWT refresh token to blacklist

    Returns:
        Boolean indicating success or failure
    """
    try:
        token_obj = RefreshToken(token)
        token_obj.blacklist()
        logger.info("Token successfully blacklisted")
        return True
    except TokenError as e:
        logger.error(f"Token blacklisting failed due to TokenError: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Token blacklisting failed: {str(e)}")
        return False


def verify_user_email(user: User) -> bool:
    """
    Mark a user's email as verified.

    Args:
        user: User to verify

    Returns:
        Boolean indicating success or failure
    """
    try:
        user.is_verified = True
        user.save(update_fields=["is_verified"])
        logger.info(f"Email verified for user {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to verify email for user {user.email}: {str(e)}")
        return False
