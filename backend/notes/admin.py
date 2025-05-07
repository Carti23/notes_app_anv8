from django.contrib import admin

from .models import Note, NoteHistory


admin.site.register(Note)
admin.site.register(NoteHistory)
