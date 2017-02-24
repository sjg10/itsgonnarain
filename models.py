from __future__ import unicode_literals

from django.conf import settings
from django.db import models
import datetime

# Create your models here.
class Track(models.Model):
    name = models.CharField(max_length=30)
    datetime_lastmodified = models.DateTimeField(auto_now=True)
    recommended_start_time = models.DecimalField(max_digits=4, decimal_places=2)
    recommended_end_time = models.DecimalField(max_digits=4, decimal_places=2)
    recommended_ratio = models.DecimalField(max_digits=4, decimal_places=3)
    sound_file = models.FileField(upload_to="tracks/",default='tracks/none.wav')
