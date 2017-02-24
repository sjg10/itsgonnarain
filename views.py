from django.views import generic

from .models import Track

class IndexView(generic.ListView):
    """
        List view to serve the index page with the track data.
    """
    template_name = 'itsgonnarain/index.html'
    model = Track
    context_object_name = 'tracks'
