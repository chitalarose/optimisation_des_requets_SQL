from django.db import models
from django.contrib.auth.models import User

class Cours(models.Model):
    """Table pour stocker les leçons sur l'optimisation SQL"""
    titre = models.CharField(max_length=200, verbose_name="Titre du cours")
    slug = models.SlugField(unique=True, blank=True, null=True)
    description = models.TextField(verbose_name="Introduction/Description")
    contenu = models.TextField(verbose_name="Contenu textuel du cours (Markdown ou HTML)")
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titre

class Quiz(models.Model):
    """Table pour les Quiz associés à un cours spécifique"""
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name='quiz')
    question = models.TextField(verbose_name="Question du quiz")
    
    # Les options de réponse
    option1 = models.CharField(max_length=255, verbose_name="Option A")
    option2 = models.CharField(max_length=255, verbose_name="Option B")
    option3 = models.CharField(max_length=255, verbose_name="Option C", blank=True, null=True)
    option4 = models.CharField(max_length=255, verbose_name="Option D", blank=True, null=True)
    
    # La bonne réponse (ex: 'option1', 'option2', etc.)
    reponse_correcte = models.CharField(
        max_length=10, 
        choices=[('1', 'Option A'), ('2', 'Option B'), ('3', 'Option C'), ('4', 'Option D')],
        verbose_name="Numéro de la bonne réponse"
    )

    def __str__(self):
        return f"Quiz pour : {self.cours.titre} - {self.question[:30]}..."