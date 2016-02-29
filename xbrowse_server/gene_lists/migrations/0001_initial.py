# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-25 01:49
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GeneList',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField(max_length=40)),
                ('name', models.CharField(max_length=140)),
                ('description', models.TextField()),
                ('is_public', models.BooleanField(default=False)),
                ('last_updated', models.DateTimeField(blank=True, null=True)),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='GeneListItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('gene_id', models.CharField(max_length=20)),
                ('description', models.TextField(default=b'')),
                ('gene_list', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gene_lists.GeneList')),
            ],
        ),
    ]
