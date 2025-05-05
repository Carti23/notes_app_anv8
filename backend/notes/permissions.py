from rest_framework import permissions


class IsOwnerOrSharedWith(permissions.BasePermission):
    """
    Custom permission to only allow owners or users with shared access to a note.
    """

    message = "You don't have permission to access this note."

    def has_object_permission(self, request, view, obj):
        # Check if the request user is the owner
        if obj.owner == request.user:
            return True

        # Check if the request user is in shared_with
        if request.user in obj.shared_with.all():
            # For shared users, only allow GET, HEAD, OPTIONS
            if request.method in permissions.SAFE_METHODS:
                return True
            # Also allow PUT and PATCH for editing
            if request.method in ["PUT", "PATCH"]:
                return True

        return False


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """

    message = "Only the owner can perform this action."

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsVerifiedUser(permissions.BasePermission):
    """
    Custom permission to only allow verified users to access certain views.
    """

    message = "Your account must be verified to perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified
