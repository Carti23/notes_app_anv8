from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Note, NoteHistory

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class NoteHistorySerializer(serializers.ModelSerializer):
    edited_by = UserSerializer(read_only=True)

    class Meta:
        model = NoteHistory
        fields = ["id", "content", "edited_by", "created_at"]
        read_only_fields = ["id", "created_at"]


class NoteSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    shared_with = UserSerializer(many=True, read_only=True)
    last_edited_by = UserSerializer(read_only=True)

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "owner",
            "shared_with",
            "is_archived",
            "is_pinned",
            "created_at",
            "updated_at",
            "last_edited_by",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at", "last_edited_by"]


class NoteCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "is_archived", "is_pinned"]


class NoteShareSerializer(serializers.Serializer):
    user_id = serializers.UUIDField(required=True)
