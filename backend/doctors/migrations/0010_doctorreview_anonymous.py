# Generated by Django 3.2 on 2023-11-30 13:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('doctors', '0009_auto_20231130_0530'),
    ]

    operations = [
        migrations.AddField(
            model_name='doctorreview',
            name='anonymous',
            field=models.BooleanField(default=False),
        ),
    ]