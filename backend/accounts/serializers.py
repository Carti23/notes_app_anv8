from typing import Any, Dict

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from accounts.models import User, UserContact


class UserBaseSerializer(serializers.ModelSerializer):
    """Base serializer for User model with common fields."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id", "email"]


class UserContactSerializer(UserBaseSerializer):
    """Serializer for user contact information."""

    nickname = serializers.SerializerMethodField()

    class Meta(UserBaseSerializer.Meta):
        fields = UserBaseSerializer.Meta.fields + ["nickname"]

    def get_nickname(self, obj: User) -> str:
        """Get the nickname for this contact if available."""
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            try:
                contact = UserContact.objects.get(user=request.user, contact=obj)
                return contact.nickname
            except UserContact.DoesNotExist:
                pass
        return ""


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password confirmation."""

    password = serializers.CharField(
        style={"input_type": "password"},
        write_only=True,
        validators=[validate_password],
    )
    password2 = serializers.CharField(
        style={"input_type": "password"}, write_only=True, label="Confirm password"
    )

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "bio",
            "password",
            "password2",
        ]
        extra_kwargs = {
            "email": {"required": True},
            "username": {"required": True},
            "first_name": {"required": False},
            "last_name": {"required": False},
            "bio": {"required": False},
        }

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """Validate that passwords match and meet requirements."""
        password = attrs.get("password")
        password2 = attrs.get("password2")

        if password != password2:
            raise serializers.ValidationError({"message": "Passwords do not match."})

        return attrs

    def validate_email(self, value: str) -> str:
        """Validate that the email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                {"message": "This email is already in use."}
            )
        return value

    def validate_username(self, value: str) -> str:
        """Validate that the username is unique."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                {"message": "This username is already in use."}
            )
        return value

    def create(self, validated_data: Dict[str, Any]) -> User:
        """Create a new user with hashed password."""
        validated_data.pop("password2", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    email = serializers.EmailField(max_length=255)
    password = serializers.CharField(style={"input_type": "password"}, write_only=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """Validate login credentials."""
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required")

        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with read-only fields."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "is_verified",
            "date_joined",
        ]
        read_only_fields = ["id", "email", "date_joined", "is_verified"]

    def validate_username(self, value: str) -> str:
        """Validate that the username is unique."""
        user = self.context["request"].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value


class UserContactCreateSerializer(serializers.Serializer):
    """Serializer for creating user contacts."""

    email = serializers.EmailField(required=True)
    nickname = serializers.CharField(max_length=100, required=False, allow_blank=True)


class UserSearchSerializer(serializers.Serializer):
    """Serializer for user search queries."""

    query = serializers.CharField(required=True, min_length=2)
    email = serializers.EmailField(required=False)

    def __init__(self, *args, **kwargs):
        """Initialize with optional field filtering."""
        only_fields = kwargs.pop("only_fields", None)
        super().__init__(*args, **kwargs)

        if only_fields:
            allowed_fields = set(only_fields)
            for field_name in list(self.fields):
                if field_name not in allowed_fields:
                    self.fields.pop(field_name)
