# Generated by Django 3.2.14 on 2022-09-21 18:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('seqr', '0047_auto_20220908_1851'),
    ]

    operations = [
        migrations.AddField(
            model_name='savedvariant',
            name='matchmaker_submission',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='matchmaker.matchmakersubmission'),
        ),
        # TODO add correct references
    ]
