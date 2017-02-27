from django import forms

from .models import Track

class TrackForm(forms.ModelForm):
    class Meta:
        model = Track
        fields = ('name', 'recommended_start_time', 'recommended_end_time', 'recommended_ratio', 'sound_file')
    #TODO: add validation for sound_file
