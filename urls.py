from django.conf.urls import url,include
from django.contrib import admin

from . import views

app_name = 'itsgonnarain'
urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
]
