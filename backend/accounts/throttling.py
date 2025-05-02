from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class AuthRateThrottle(AnonRateThrottle):
    rate = '5/minute'  # Limit to 5 authentication attempts per minute per IP

class UserSearchRateThrottle(UserRateThrottle):
    rate = '30/minute'  # Limit to 30 user searches per minute per user

class ContactRateThrottle(UserRateThrottle):
    rate = '20/hour'  # Limit to 20 contact operations per hour per user 