# Generated by Django 3.2 on 2023-12-27 12:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('doctors', '0013_auto_20231223_0642'),
    ]

    operations = [
        migrations.RenameField(
            model_name='doctorlocation',
            old_name='address',
            new_name='long_address',
        ),
    ]