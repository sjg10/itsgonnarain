from django import forms
from django.core.exceptions import ValidationError

from .models import Track

class TrackForm(forms.ModelForm):
    class Meta:
        model = Track
        fields = ('name', 'recommended_start_time', 'recommended_end_time', 'recommended_ratio', 'sound_file')
    def clean_recommended_ratio(self):
        """
        Validation run on the recommended ratio field when changed
        """
        # Get the inputted ratio
        recommended_ratio = self.cleaned_data.get('recommended_ratio', False)
        # Check if it has been modified
        if not self.instance.recommended_ratio == recommended_ratio:
            # If so, check it is at least 1
            if recommended_ratio < 1:
                raise ValidationError("Ratio must be at least 1!")
        return recommended_ratio
