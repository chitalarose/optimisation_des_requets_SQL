// ============================================
// QUIZ.JS — Dev5 — Quiz interactif SQL
// Optimisation des Requêtes SQL
// ============================================

// --- État global ---
let currentQuestion = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let answered = false;
let correctCount = 0;
let timerInterval = null;
let timeLeft = 30;

// --- Banque de questions ---
const QUESTIONS = [
  {
    question: "Quelle commande analyse le plan d'exécution ET mesure les temps réels ?",
    options: ["ANALYZE", "EXPLAIN", "EXPLAIN ANALYZE", "PROFILE"],
    correct: 2,
    feedback: "EXPLAIN affiche seulement le plan estimé. EXPLAIN ANALYZE exécute réellement la requête et mesure les temps réels en ms.",
    level: "débutant"
  },
  {
    question: "Pourquoi éviter DATE(created_at) = '2024-01-01' sur une grande table ?",
    options: [
      "Syntaxe incorrecte",
      "Empêche l'utilisation de l'index",
      "Renvoie de mauvais résultats",
      "Trop verbeux"
    ],
    correct: 1,
    feedback: "Appliquer une fonction sur une colonne indexée (DATE()) empêche l'optimiseur d'utiliser l'index B-tree → Seq Scan forcé.",
    level: "intermédiaire"
  },
  {
    question: "Qu'est-ce qu'un Seq Scan dans EXPLAIN ?",
    options: [
      "Lecture via un index",
      "Lecture ligne par ligne de toute la table",
      "Jointure par hachage",
      "Tri rapide"
    ],
    correct: 1,
    feedback: "Sequential Scan = parcours complet de la table. À éviter sur les grandes tables.",
    level: "débutant"
  },
  {
    question: "Syntaxe correcte pour créer un index ?",
    options: [
      "ADD INDEX nom ON table(col)",
      "CREATE INDEX nom ON table(col)",
      "MAKE INDEX nom FOR table.col",
      "SET INDEX nom table col"
    ],
    correct: 1,
    feedback: "La syntaxe SQL standard est : CREATE INDEX nom_index ON nom_table (colonne);",
    level: "débutant"
  },
  {
    question: "Que signifie 'rows' dans EXPLAIN ANALYZE ?",
    options: [
      "Nombre de colonnes",
      "Estimation du nombre de lignes traitées",
      "Taille en Mo",
      "Nombre de jointures"
    ],
    correct: 1,
    feedback: "rows = estimation de l'optimiseur du nombre de lignes qu'il va traiter.",
    level: "débutant"
  },
  {
    question: "Quel type de jointure est généralement le plus performant sur de grandes tables ?",
    options: [
      "Nested Loop Join",
      "Hash Join",
      "Merge Join",
      "Cross Join"
    ],
    correct: 1,
    feedback: "Le Hash Join est souvent le plus rapide sur de grandes tables sans tri préalable. PostgreSQL choisit automatiquement selon les statistiques.",
    level: "intermédiaire"
  },
  {
    question: "Quelle clause SQL permet d'éviter un tri supplémentaire lors d'une pagination ?",
    options: [
      "GROUP BY",
      "ORDER BY avec un index trié",
      "HAVING",
      "DISTINCT"
    ],
    correct: 1,
    feedback: "Si l'index couvre la colonne du ORDER BY dans le même sens, PostgreSQL peut lire l'index en ordre → pas de Sort node dans EXPLAIN.",
    level: "avancé"
  },
  {
    question: "Qu'est-ce qu'un index couvrant (covering index) ?",
    options: [
      "Un index sur plusieurs colonnes",
      "Un index qui contient toutes les colonnes nécessaires à la requête",
      "Un index partiel sur une condition WHERE",
      "Un index sur une clé étrangère"
    ],
    correct: 1,
    feedback: "Un covering index contient toutes les colonnes de la requête → Index-Only Scan possible, zéro accès à la table principale.",
    level: "avancé"
  },
  {
    question: "Que fait la commande VACUUM ANALYZE en PostgreSQL ?",
    options: [
      "Supprime les doublons",
      "Nettoie les tuples morts et met à jour les statistiques",
      "Réindexe toutes les tables",
      "Vide le cache mémoire"
    ],
    correct: 1,
    feedback: "VACUUM récupère l'espace des lignes supprimées/modifiées (tuples morts). ANALYZE met à jour les statistiques pour l'optimiseur de requêtes.",
    level: "intermédiaire"
  },
  {
    question: "Que signifie 'N+1 query problem' en développement ?",
    options: [
      "Une requête qui retourne N+1 colonnes",
      "1 requête principale + N requêtes individuelles pour chaque résultat",
      "Une jointure sur N+1 tables",
      "Un index avec N+1 colonnes"
    ],
    correct: 1,
    feedback: "Le problème N+1 : 1 requête pour lister 100 users, puis 100 requêtes pour charger leurs posts = 101 requêtes. Solution : JOIN ou SELECT IN.",
    level: "intermédiaire"
  }
];

// --- Initialisation ---
document.addEventListener("DOMContentLoaded", () => {
  initQuiz();
});

function initQuiz() {
  currentQuestion = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;
  answered = false;
  correctCount = 0;

  updateStats();
  loadQuestion();
}

// --- Chargement d'une question ---
function loadQuestion() {
  clearTimer();

  if (currentQuestion >= QUESTIONS.length) {
    showFinalScore();
    return;
  }

  const q = QUESTIONS[currentQuestion];
  const total = QUESTIONS.length;

  // Mise à jour barre de progression
  const progressPct = (currentQuestion / total) * 100;
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) progressBar.style.width = progressPct + "%";

  // Numéro de question
  const qNumber = document.getElementById("question-number");
  if (qNumber) qNumber.textContent = `Question ${currentQuestion + 1} / ${total}`;

  // Badge niveau
  const levelBadge = document.getElementById("level-badge");
  if (levelBadge) {
    levelBadge.textContent = q.level || "débutant";
    levelBadge.className = "level-badge level-" + (q.level || "débutant").replace("é", "e");
  }

  // Texte de la question
  const qText = document.getElementById("question-text");
  if (qText) qText.innerHTML = q.question;

  // Options
  const container = document.getElementById("options-container");
  if (container) {
    container.innerHTML = "";
    const letters = ["A", "B", "C", "D"];

    q.options.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.dataset.index = index;
      btn.innerHTML = `
        <span class="option-letter">${letters[index]}</span>
        <span class="option-text">${option}</span>
      `;
      btn.addEventListener("click", () => selectAnswer(index));
      container.appendChild(btn);
    });
  }

  // Reset feedback
  const feedback = document.getElementById("feedback");
  if (feedback) {
    feedback.style.display = "none";
    feedback.textContent = "";
    feedback.className = "feedback";
  }

  // Reset bouton suivant
  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) nextBtn.style.display = "none";

  answered = false;

  // Démarrer le timer
  startTimer();
}

// --- Sélection d'une réponse ---
function selectAnswer(selectedIndex) {
  if (answered) return;
  answered = true;
  clearTimer();

  const q = QUESTIONS[currentQuestion];
  const buttons = document.querySelectorAll(".option-btn");

  buttons.forEach(btn => btn.disabled = true);

  const isCorrect = selectedIndex === q.correct;

  // Coloration des réponses
  buttons[q.correct].classList.add("correct");
  if (!isCorrect) {
    buttons[selectedIndex].classList.add("wrong");
  }

  // Mise à jour score et streak
  if (isCorrect) {
    const bonus = streak >= 3 ? 15 : (streak >= 1 ? 12 : 10);
    score += bonus;
    streak++;
    correctCount++;
    if (streak > bestStreak) bestStreak = streak;
  } else {
    streak = 0;
  }

  // Affichage feedback
  showFeedback(isCorrect, q.feedback);
  updateStats();

  // Afficher bouton suivant
  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) nextBtn.style.display = "block";

  // Animation de score
  animateScore();
}

// --- Affichage du feedback ---
function showFeedback(isCorrect, message) {
  const feedback = document.getElementById("feedback");
  if (!feedback) return;

  feedback.style.display = "block";
  feedback.className = "feedback " + (isCorrect ? "correct" : "incorrect");
  feedback.innerHTML = isCorrect
    ? `<strong>✓ Correct !</strong> ${message}`
    : `<strong>✗ Incorrect.</strong> ${message}`;
}

// --- Timer ---
function startTimer() {
  timeLeft = 30;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearTimer();
      if (!answered) {
        // Temps écoulé → traité comme mauvaise réponse
        answered = true;
        streak = 0;
        updateStats();
        const q = QUESTIONS[currentQuestion];
        const buttons = document.querySelectorAll(".option-btn");
        buttons.forEach(btn => btn.disabled = true);
        buttons[q.correct].classList.add("correct");
        showFeedback(false, "⏱ Temps écoulé ! " + q.feedback);
        const nextBtn = document.getElementById("next-btn");
        if (nextBtn) nextBtn.style.display = "block";
      }
    }
  }, 1000);
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const timerEl = document.getElementById("timer");
  if (!timerEl) return;
  timerEl.textContent = timeLeft + "s";
  timerEl.className = "timer" + (timeLeft <= 10 ? " urgent" : "");
}

// --- Mise à jour des stats ---
function updateStats() {
  const scoreEl = document.getElementById("score-display");
  if (scoreEl) scoreEl.textContent = score;

  const streakEl = document.getElementById("streak-display");
  if (streakEl) streakEl.textContent = "🔥 " + streak;
}

// --- Question suivante ---
function nextQuestion() {
  currentQuestion++;
  loadQuestion();
}

// --- Écran final ---
function showFinalScore() {
  clearTimer();

  const quizSection = document.getElementById("quiz-section");
  const finalSection = document.getElementById("final-section");

  if (quizSection) quizSection.style.display = "none";
  if (finalSection) finalSection.style.display = "block";

  const total = QUESTIONS.length;
  const percentage = Math.round((correctCount / total) * 100);

  // Score final
  const finalScoreEl = document.getElementById("final-score");
  if (finalScoreEl) finalScoreEl.textContent = score + " pts";

  // Taux de réussite
  const percentageEl = document.getElementById("final-percentage");
  if (percentageEl) percentageEl.textContent = percentage + "%";

  // Bonnes réponses
  const correctEl = document.getElementById("final-correct");
  if (correctEl) correctEl.textContent = correctCount + " / " + total;

  // Meilleure série
  const streakEl = document.getElementById("final-streak");
  if (streakEl) streakEl.textContent = bestStreak;

  // Badge et message selon le niveau
  const badge = getBadge(percentage);
  const badgeEl = document.getElementById("final-badge");
  if (badgeEl) {
    badgeEl.textContent = badge.label;
    badgeEl.className = "final-badge badge-" + badge.type;
  }

  const messageEl = document.getElementById("final-message");
  if (messageEl) messageEl.textContent = badge.message;

  // Graphique récapitulatif (Chart.js)
  renderResultChart(correctCount, total - correctCount);
}

// --- Badge selon le score ---
function getBadge(pct) {
  if (pct >= 80) return {
    label: "🏆 Expert SQL",
    type: "expert",
    message: "Excellente maîtrise de l'optimisation SQL ! Vous êtes prêt pour la production."
  };
  if (pct >= 60) return {
    label: "⚡ Intermédiaire",
    type: "intermediate",
    message: "Bonne base ! Pratiquez encore avec le laboratoire pour maîtriser EXPLAIN ANALYZE."
  };
  return {
    label: "📚 Débutant",
    type: "beginner",
    message: "Recommencez les cours de base sur les index et EXPLAIN. Vous y êtes presque !"
  };
}

// --- Graphique résultats avec Chart.js ---
function renderResultChart(correct, wrong) {
  const canvas = document.getElementById("result-chart");
  if (!canvas || typeof Chart === "undefined") return;

  // Détruire le graphique précédent si existant
  if (window.resultChartInstance) {
    window.resultChartInstance.destroy();
  }

  window.resultChartInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Correctes", "Incorrectes"],
      datasets: [{
        data: [correct, wrong],
        backgroundColor: ["#1D9E75", "#D85A30"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: { position: "bottom" },
        tooltip: { enabled: true }
      }
    }
  });
}

// --- Animation score ---
function animateScore() {
  const scoreEl = document.getElementById("score-display");
  if (!scoreEl) return;
  scoreEl.classList.add("score-pop");
  setTimeout(() => scoreEl.classList.remove("score-pop"), 300);
}

// --- Restart ---
function restartQuiz() {
  const quizSection = document.getElementById("quiz-section");
  const finalSection = document.getElementById("final-section");
  if (quizSection) quizSection.style.display = "block";
  if (finalSection) finalSection.style.display = "none";
  initQuiz();
}

// --- Filtrage par niveau (optionnel) ---
function filterByLevel(level) {
  return QUESTIONS.filter(q => q.level === level);
}

// Exposition publique pour le HTML
window.nextQuestion = nextQuestion;
window.restartQuiz = restartQuiz;