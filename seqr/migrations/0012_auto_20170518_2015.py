# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-05-18 20:15
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('seqr', '0011_auto_20170517_2222'),
    ]

    operations = [
        migrations.AddField(
            model_name='varianttagtype',
            name='is_built_in',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='varianttagtype',
            name='order',
            field=models.FloatField(null=True),
        ),
    ]
