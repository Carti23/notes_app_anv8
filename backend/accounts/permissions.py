from typing import Any

from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView

from .models import User, UserContact


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        """
        Check if the requesting user is the owner of the object.

        For User objects, checks if the object is the requesting user.
        For objects with a 'user' attribute, checks if that user is the requesting user.
        """
        # Read permissions are allowed to any request for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # Check if the object has a user attribute and if that user is the request user
        if hasattr(obj, "user"):
            return obj.user == request.user
        # If the object itself is a user model
        elif isinstance(obj, User):
            return obj.id == request.user.id

        return False


class IsVerifiedUser(permissions.BasePermission):
    """
    Custom permission to only allow verified users to access certain views.
    """

    def has_permission(self, request: Request, view: APIView) -> bool:
        """Check if the user is authenticated and verified."""
        return request.user.is_authenticated and request.user.is_verified


class IsContactOwner(permissions.BasePermission):
    """
    Custom permission for contacts - only the user who created the contact can modify it.
    """

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        """
        Check if the requesting user owns the contact relationship.

        For User objects in a ContactViewSet, check if there's a UserContact relation.
        For UserContact objects, check if the user attribute matches the requesting user.
        """
        # If obj is a Contact object
        if hasattr(obj, "user") and hasattr(obj, "contact"):
            return obj.user == request.user

        # If obj is a User (contact) being accessed through ContactViewSet
        if (
            isinstance(obj, User)
            and hasattr(view, "basename")
            and view.basename == "contact"
        ):
            try:
                return UserContact.objects.filter(
                    user=request.user, contact=obj
                ).exists()
            except Exception:
                pass

        return False


class ReadOnly(permissions.BasePermission):
    """
    Permission that only allows read-only methods.
    """

    def has_permission(self, request: Request, view: APIView) -> bool:
        """Check if the request method is safe (read-only)."""
        return request.method in permissions.SAFE_METHODS
