# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-27 16:58
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('itsgonnarain', '0002_auto_20170224_1608'),
    ]

    operations = [
        migrations.RenameField(
            model_name='track',
            old_name='datetime_lastmodified',
            new_name='Last Modified',
        ),
    ]
