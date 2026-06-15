from django.db import models
from django.contrib.auth.models import User

# 1. Modèle pour l'espace "Learn" (Les cours/tutoriels SQL)
class Cours(models.Model):
    NIVEAU_CHOICES = (
        ('DEB', 'Débutant'),
        ('INT', 'Intermédiaire'),
        ('AV', 'Avancé'),
    )
    titre = models.CharField(max_length=200)
    niveau = models.CharField(max_length=3, choices=NIVEAU_CHOICES)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    contenu_markdown = models.TextField()
    cree_le = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titre

# 2. Modèle pour l'espace "Optimize" (La Sandbox et l'historique de l'éditeur)
class RequeteSandbox(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    titre_analyse = models.CharField(max_length=100, default="Draft")
    code_sql_initial = models.TextField()  # La requête brute de l'utilisateur
    code_sql_optimise = models.TextField(blank=True, null=True)  # La suggestion optimisée
    
    # Métriques (pour les graphiques Before/After du Développeur 5)
    temps_execution_avant = models.FloatField(help_text="En millisecondes")
    temps_execution_apres = models.FloatField(help_text="En millisecondes", blank=True, null=True)
    score_efficience = models.IntegerField(default=0)  # Note sur 100
    
    # Données pour le flowchart du plan d'exécution (Format JSON)
    execution_plan_json = models.JSONField(blank=True, null=True)
    
    cree_le = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analyse {self.titre_analyse} - Score: {self.score_efficience}/100"

# 3. Modèle pour les Recommandations (Le panneau latéral droit du dashboard)
class RecommandationOptimisation(models.Model):
    requete_analyse = models.ForeignKey(RequeteSandbox, on_delete=models.CASCADE, related_name='recommandations')
    titre = models.CharField(max_length=200)  # Ex: "Use specific columns (not *)"
    description = models.TextField()
    impact = models.CharField(max_length=10, choices=(('LOW', 'Low'), ('MED', 'Med'), ('HIGH', 'High')))

    def __str__(self):
        return self.titre

# 4. Modèle pour le Développeur 2 (Base de test pour simuler les lenteurs)
class CommandeTest(models.Model):
    """Table de test du Développeur 2 contenant des milliers de lignes pour simuler les requêtes lentes"""
    client_nom = models.CharField(max_length=100)
    produit = models.CharField(max_length=100)
    quantite = models.IntegerField()
    prix_unitaire = models.FloatField()
    date_commande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, default='En cours')

    def __str__(self):
        return f"Commande {self.id} - {self.client_nom}"