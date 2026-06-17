from django.contrib import admin
from .models import Cours, Quiz

@admin.register(Cours)
class CoursAdmin(admin.ModelAdmin):
    list_display = ('titre', 'date_creation')
    search_fields = ('titre', 'description')
    prepopulated_fields = {'slug': ('titre',)}

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('cours', 'question', 'reponse_correcte')
    list_filter = ('cours',)
    search_fields = ('question',)