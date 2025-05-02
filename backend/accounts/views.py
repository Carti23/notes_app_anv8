import logging
from typing import Any

from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Q

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import User, UserContact
from .permissions import IsOwner, IsContactOwner
from .serializers import (
    UserContactSerializer,
    UserContactCreateSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSearchSerializer,
)
from .services import get_tokens_for_user, blacklist_token
from .throttling import AuthRateThrottle, UserSearchRateThrottle, ContactRateThrottle

logger = logging.getLogger("custom_logger")


class AuthViewSet(viewsets.GenericViewSet):
    """ViewSet for handling authentication-related actions."""
    throttle_classes = [AuthRateThrottle]

    @swagger_auto_schema(
        request_body=UserRegistrationSerializer,
        responses={201: openapi.Response("Registration successful", UserRegistrationSerializer)},
    )
    @action(detail=False, methods=["post"], url_path="register")
    @transaction.atomic
    def register(self, request: Request) -> Response:
        """Register a new user and return authentication tokens."""
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        user.is_verified = True
        user.save()

        tokens = get_tokens_for_user(user)

        return Response(
            {
                "token": tokens,
                "msg": "Registration successful.",
            },
            status=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        request_body=UserLoginSerializer,
        responses={
            200: openapi.Response("Login successful"),
            401: openapi.Response("Invalid credentials")
        },
    )
    @action(detail=False, methods=["post"], url_path="login")
    def login(self, request: Request) -> Response:
        """Authenticate a user and return tokens."""
        self.throttle_classes = [ScopedRateThrottle]
        self.throttle_scope = "auth"
        """Authenticate a user and return tokens."""
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        user = authenticate(email=email, password=password)

        if user is None:
            return Response(
                {"errors": {"non_field_errors": ["Invalid email or password"]}},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = get_tokens_for_user(user)
        return Response(
            {"token": tokens, "msg": "Login successful"}, 
            status=status.HTTP_200_OK
        )

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token')
            },
            required=['refresh']
        ),
        responses={
            200: openapi.Response("Logout successful"),
            400: openapi.Response("Invalid token or token required")
        },
    )
    @action(detail=False, methods=["post"], url_path="logout", permission_classes=[IsAuthenticated])
    def logout(self, request: Request) -> Response:
        """Blacklist a refresh token to log out a user."""
        refresh_token = request.data.get("refresh")
        
        if not refresh_token:
            return Response(
                {"errors": {"refresh": "Refresh token is required"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        success = blacklist_token(refresh_token)
        
        if success:
            logger.info(f"User {request.user.email} successfully logged out.")
            return Response({"msg": "Logout successful"}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"errors": {"detail": "Invalid token or logout failed"}},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UserViewSet(mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  viewsets.GenericViewSet):
    """ViewSet for user profile operations."""
    
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    queryset = User.objects.all()
    
    def get_throttles(self):
        """
        Return appropriate throttle class based on the action.
        """
        if self.action == 'search':
            return [UserSearchRateThrottle()]
        return []
    
    def get_object(self) -> User:
        """Return the authenticated user for 'me' actions."""
        if self.action == 'me':
            return self.request.user
        return super().get_object()
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Get or update the authenticated user's profile.
        
        GET: Retrieve current user profile
        PUT/PATCH: Update current user profile
        """
        if request.method == 'GET':
            return self.retrieve(request, *args, **kwargs)
        elif request.method in ['PUT', 'PATCH']:
            return self.update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        query_serializer=UserSearchSerializer,
        responses={200: UserContactSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def search(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Search for users by email or username."""
        serializer = UserSearchSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        
        query = serializer.validated_data['query']
        
        # Search by email or username, excluding the current user
        users = User.objects.filter(
            Q(email__icontains=query) | 
            Q(username__icontains=query)
        ).exclude(id=request.user.id)[:10]  # Limit to 10 results for performance
        
        serializer = UserContactSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)
    
    @swagger_auto_schema(
        query_serializer=UserSearchSerializer(only_fields=['email']),
        responses={
            200: UserContactSerializer(),
            404: openapi.Response("User not found"),
            400: openapi.Response("Invalid request")
        }
    )
    @action(detail=False, methods=['get'])
    def find(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Find a user by exact email match."""
        serializer = UserSearchSerializer(data=request.query_params, only_fields=['email'])
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            # Find the user by exact email match
            user = User.objects.get(email=email)
            
            # Don't allow finding yourself
            if user.id == request.user.id:
                return Response(
                    {"error": "You cannot share with yourself"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            serializer = UserContactSerializer(user, context={'request': request})
            return Response(serializer.data)
            
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )


class ContactViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user contacts."""
    
    permission_classes = [IsAuthenticated, IsContactOwner]
    throttle_classes = [ContactRateThrottle]
    
    def get_serializer_class(self):
        """Return the appropriate serializer based on the action."""
        if self.action == 'create':
            return UserContactCreateSerializer
        return UserContactSerializer
    
    def get_queryset(self):
        """Return only contacts associated with the current user."""
        return User.objects.filter(
            contact_relationships__user=self.request.user
        ).order_by('-contact_relationships__created_at')
    
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Add a new contact for the current user."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        nickname = serializer.validated_data.get('nickname', '')
        
        try:
            contact_user = User.objects.get(email=email)
            
            # Don't allow adding yourself as a contact
            if contact_user.id == request.user.id:
                return Response(
                    {"error": "You cannot add yourself as a contact"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Check if contact already exists
            contact, created = UserContact.objects.get_or_create(
                user=request.user,
                contact=contact_user,
                defaults={'nickname': nickname}
            )
            
            if not created:
                return Response(
                    {"error": "This user is already in your contacts"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(
                UserContactSerializer(contact_user, context={'request': request}).data, 
                status=status.HTTP_201_CREATED
            )
            
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Remove a contact for the current user."""
        contact_id = kwargs.get('pk')
        
        try:
            contact_user = User.objects.get(id=contact_id)
            contact = UserContact.objects.get(user=request.user, contact=contact_user)
            contact.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (User.DoesNotExist, UserContact.DoesNotExist):
            return Response(
                {"error": "Contact not found"},
                status=status.HTTP_404_NOT_FOUND
            )