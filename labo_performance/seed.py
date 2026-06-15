import random
from django.utils import timezone
from .models import CommandeTest

def peupler_base_de_donnees(nbre_lignes=5000):
    """Génère et insère des milliers de fausses commandes pour les tests SQL"""
    
    noms_clients = ["Aicha", "Ismail", "Mamadou", "Maymouna", "Fatima", "Sidahmed", "Mama", "Kaba", "Diallo", "Diop"]
    produits_informatiques = ["Clavier Mécanique", "Souris Gaming", "Écran 4K", "PC Portable", "Casque Audio", "Disque Dur SSD", "Câble HDMI"]
    statuts_possibles = ["En cours", "Expédié", "Livré", "Annulé"]

    print(f"🚀 Début de l'injection de {nbre_lignes} lignes dans la base de données...")
    
    commandes_a_creer = []
    
    for i in range(nbre_lignes):
        client = random.choice(noms_clients)
        produit = random.choice(produits_informatiques)
        quantite = random.randint(1, 5)
        prix = round(random.uniform(10.0, 1200.0), 2)
        statut = random.choice(statuts_possibles)
        
        # On prépare l'objet en mémoire (très rapide)
        commande = CommandeTest(
            client_nom=f"{client}_{random.randint(100, 999)}",
            produit=produit,
            quantite=quantite,
            prix_unitaire=prix,
            statut=statut
        )
        commandes_a_creer = bulk_create_items(commandes_a_creer, commande)

    # Insertion massive en un seul bloc dans la base SQL
    CommandeTest.objects.bulk_create(commandes_a_creer)
    
    print(f"✅ Succès ! {nbre_lignes} lignes ont été injectées avec succès.")

def bulk_create_items(list_obj, item):
    list_obj.append(item)
    return list_obj