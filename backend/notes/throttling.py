from rest_framework.throttling import UserRateThrottle


class NoteCreateRateThrottle(UserRateThrottle):
    rate = "10/day"  # Limit to 10 note creations per day per user


class NoteUpdateRateThrottle(UserRateThrottle):
    rate = "100/day"  # Limit to 100 note updates per day per user


class NoteShareRateThrottle(UserRateThrottle):
    rate = "50/day"  # Limit to 50 note sharing actions per day per user


class NoteHistoryRateThrottle(UserRateThrottle):
    rate = "200/day"  # Limit to 200 history views per day per user


class NoteRateThrottle(UserRateThrottle):
    rate = "60/minute"


class NoteHistoryRateThrottle(UserRateThrottle):
    rate = "120/minute"


class NoteShareRateThrottle(UserRateThrottle):
    rate = "30/minute"
