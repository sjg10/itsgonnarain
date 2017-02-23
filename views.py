from django.views import generic

class IndexView(generic.base.TemplateView):
    template_name = 'itsgonnarain/index.html'
