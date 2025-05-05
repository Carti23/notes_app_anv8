from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import models
from django.shortcuts import get_object_or_404, render
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import exception_handler

from .exceptions import NoteSharingError, NoteValidationError, UserNotFoundError
from .models import Note, NoteHistory
from .permissions import IsOwnerOrSharedWith
from .serializers import (
    NoteCreateUpdateSerializer,
    NoteHistorySerializer,
    NoteSerializer,
    NoteShareSerializer,
)
from .services import NoteService
from .throttling import (
    NoteCreateRateThrottle,
    NoteHistoryRateThrottle,
    NoteShareRateThrottle,
    NoteUpdateRateThrottle,
)

User = get_user_model()


def custom_exception_handler(exc, context):
    """
    Custom exception handler for the API.
    Provides consistent error response format across the application.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the response data
        response.data = {
            "status": "error",
            "message": str(exc),
            "code": response.status_code,
        }

        # Add additional details for specific exceptions
        if isinstance(exc, NoteSharingError):
            response.data["type"] = "sharing_error"
        elif isinstance(exc, UserNotFoundError):
            response.data["type"] = "user_not_found"
        elif isinstance(exc, NoteValidationError):
            response.data["type"] = "validation_error"
        else:
            response.data["type"] = "general_error"

    return response


class NoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Notes providing CRUD operations and sharing functionality.
    """

    permission_classes = [permissions.IsAuthenticated, IsOwnerOrSharedWith]

    def get_throttles(self):
        """
        Return appropriate throttle class based on the action.
        """
        if self.action == "create":
            return [NoteCreateRateThrottle()]
        elif self.action in ["update", "partial_update"]:
            return [NoteUpdateRateThrottle()]
        elif self.action in ["share", "unshare"]:
            return [NoteShareRateThrottle()]
        elif self.action == "history":
            return [NoteHistoryRateThrottle()]
        return []

    def get_queryset(self):
        """Get all notes for the current user."""
        return NoteService.get_user_notes(self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action in ["create", "update", "partial_update"]:
            return NoteCreateUpdateSerializer
        if self.action == "share":
            return NoteShareSerializer
        return NoteSerializer

    def perform_create(self, serializer):
        """Create a new note with history tracking."""
        note = NoteService.create_note(
            user=self.request.user,
            title=serializer.validated_data["title"],
            content=serializer.validated_data["content"],
        )
        serializer.instance = note

    def perform_update(self, serializer):
        """Update a note with history tracking."""
        note = NoteService.update_note(
            note=self.get_object(),
            title=serializer.validated_data.get("title"),
            content=serializer.validated_data.get("content"),
            user=self.request.user,
        )
        serializer.instance = note

    @action(detail=True, methods=["post"])
    def share(self, request, pk=None):
        """Share a note with another user."""
        note = self.get_object()

        try:
            NoteService.share_note(
                note=note, owner=request.user, user_id=request.data.get("user_id")
            )
            return Response(
                {"detail": "Note shared successfully."}, status=status.HTTP_200_OK
            )
        except (NoteSharingError, UserNotFoundError) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def unshare(self, request, pk=None):
        """Remove sharing access for a user."""
        note = self.get_object()

        try:
            NoteService.unshare_note(
                note=note, owner=request.user, user_id=request.data.get("user_id")
            )
            return Response(
                {"detail": "Note unshared successfully."}, status=status.HTTP_200_OK
            )
        except (NoteSharingError, UserNotFoundError) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        """Retrieve the edit history of a note."""
        note = self.get_object()
        history = NoteService.get_note_history(note)
        serializer = NoteHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def personal(self, request):
        """Retrieve only notes that the user owns."""
        notes = NoteService.get_personal_notes(request.user)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def shared(self, request):
        """Retrieve only notes that are shared with the user."""
        notes = NoteService.get_shared_notes(request.user)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)
