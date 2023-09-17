# Generated by Django 3.2 on 2023-09-16 21:30

from django.db import migrations, models
import phonenumber_field.modelfields


class Migration(migrations.Migration):

    dependencies = [
        ('doctors', '0006_auto_20230916_1853'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='doctorlocation',
            name='phones',
        ),
        migrations.AddField(
            model_name='doctorlocation',
            name='phone',
            field=phonenumber_field.modelfields.PhoneNumberField(blank=True, max_length=128, null=True, region=None),
        ),
        migrations.AlterField(
            model_name='doctor',
            name='image',
            field=models.BinaryField(blank=True, null=True),
        ),
    ]
