from django.contrib import admin

# Register your models here.

from .models import Track
from .forms import TrackForm

@admin.register(Track)
class Track(admin.ModelAdmin):
        form = TrackForm
        list_display = ('name', 'Last Modified')
        list_filter = ['Last Modified']
