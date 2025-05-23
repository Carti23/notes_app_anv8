# Generated by Django 4.0.10 on 2025-04-09 11:38

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("notes", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="notehistory",
            name="edited_by",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="note_edits",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddIndex(
            model_name="note",
            index=models.Index(fields=["owner"], name="notes_note_owner_i_d20d92_idx"),
        ),
        migrations.AddIndex(
            model_name="note",
            index=models.Index(
                fields=["updated_at"], name="notes_note_updated_0fcd5d_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="note",
            index=models.Index(
                fields=["is_pinned"], name="notes_note_is_pinn_2c469e_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="notehistory",
            index=models.Index(fields=["note"], name="notes_noteh_note_id_5d4656_idx"),
        ),
        migrations.AddIndex(
            model_name="notehistory",
            index=models.Index(
                fields=["created_at"], name="notes_noteh_created_8112bd_idx"
            ),
        ),
    ]
