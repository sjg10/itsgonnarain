from django.views import generic


class IndexView(generic.base.TemplateView):
    """
        Simple view to serve the index page.
    """
    template_name = 'itsgonnarain/index.html'
