from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import AuthenticationForm
from .forms import InscriptionForm

def inscription_view(request):
    if request.method == 'POST':
        form = InscriptionForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user) # Connecte l'utilisateur après l'inscription
            return redirect('liste_cours') # Redirigera vers la liste des cours plus tard
    else:
        form = InscriptionForm()
    return render(request, 'core/inscription.html', {'form': form})

def connexion_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('liste_cours')
    else:
        form = AuthenticationForm()
    return render(request, 'core/connexion.html', {'form': form})

def deconnexion_view(request):
    logout(request)
    return redirect('connexion')

from .models import Cours

def liste_cours_view(request):
    """Vue pour afficher tous les cours disponibles"""
    les_cours = Cours.objects.all().order_update('-date_creation')
    return render(request, 'core/liste_cours.html', {'courses': les_cours})

def detail_cours_view(request, slug):
    """Vue pour afficher un cours précis et ses quiz associés"""
    un_cours = get_object_or_404(Cours, slug=slug)
    les_quiz = un_cours.quiz.all() # Récupère tous les quiz liés à ce cours
    context = {
        'cours': un_cours,
        'quizs': les_quiz
    }
    return render(request, 'core/detail_cours.html', context)