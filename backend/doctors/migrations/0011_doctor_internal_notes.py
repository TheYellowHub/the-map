# Generated by Django 3.2 on 2023-12-07 20:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('doctors', '0010_doctorreview_anonymous'),
    ]

    operations = [
        migrations.AddField(
            model_name='doctor',
            name='internal_notes',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
