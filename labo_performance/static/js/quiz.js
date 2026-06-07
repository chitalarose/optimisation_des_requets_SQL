// ============================================
// QUIZ.JS - Dev5 - Quiz interactif SQL
// ============================================

let currentQuestion = 0;
let score = 0;
let streak = 0;
let answered = false;

const QUESTIONS = [
    {
        question: "Quelle commande analyse le plan d'exécution d'une requête SQL ?",
        options: ["ANALYZE", "EXPLAIN", "DESCRIBE", "PROFILE"],
        correct: 1,
        feedback: "EXPLAIN affiche le plan. EXPLAIN ANALYZE l'exécute et mesure les temps réels."
    },
    {
        question: "Pourquoi éviter DATE(created_at) = '2024-01-01' sur une grande table ?",
        options: ["Syntaxe incorrecte", "Empêche l'utilisation de l'index", "Renvoie de mauvais résultats", "Trop verbeux"],
        correct: 1,
        feedback: "La fonction DATE() sur une colonne empêche l'optimiseur d'utiliser un index B-tree."
    },
    {
        question: "Qu'est-ce qu'un Seq Scan dans EXPLAIN ?",
        options: ["Lecture via un index", "Lecture ligne par ligne de toute la table", "Jointure par hachage", "Tri rapide"],
        correct: 1,
        feedback: "Sequential Scan = parcours complet de la table. À éviter sur les grandes tables."
    },
    {
        question: "Syntaxe correcte pour créer un index ?",
        options: ["ADD INDEX nom ON table(col)", "CREATE INDEX nom ON table(col)", "MAKE INDEX nom FOR table.col", "SET INDEX nom table col"],
        correct: 1,
        feedback: "La syntaxe SQL standard est : CREATE INDEX nom_index ON nom_table (colonne);"
    },
    {
        question: "Que signifie 'rows' dans EXPLAIN ANALYZE ?",
        options: ["Nombre de colonnes", "Estimation du nombre de lignes traitées", "Taille en Mo", "Nombre de jointures"],
        correct: 1,
        feedback: "rows = estimation de l'optimiseur du nombre de lignes qu'il va traiter."
    }
];

function loadQuestion() {
    if (currentQuestion >= QUESTIONS.length) {
        showFinalScore();
        return;
    }

    answered = false;
    const q = QUESTIONS[currentQuestion];

    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-btn');
    const progressEl = document.getElementById('quiz-progress-fill');

    if (questionEl) questionEl.textContent = `Q${currentQuestion + 1} / ${QUESTIONS.length} — ${q.question}`;
    if (feedbackEl) { feedbackEl.style.display = 'none'; feedbackEl.textContent = ''; }
    if (nextBtn) nextBtn.style.display = 'none';
    if (progressEl) progressEl.style.width = ((currentQuestion / QUESTIONS.length) * 100) + '%';

    if (optionsEl) {
        optionsEl.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt';
            btn.innerHTML = `<span class="opt-letter">${letters[i]}</span> ${opt}`;
            btn.addEventListener('click', () => answer(i));
            optionsEl.appendChild(btn);
        });
    }

    updateScoreDisplay();
}

function answer(index) {
    if (answered) return;
    answered = true;

    const q = QUESTIONS[currentQuestion];
    const buttons = document.querySelectorAll('.quiz-opt');
    const feedbackEl = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-btn');

    buttons.forEach(btn => btn.disabled = true);

    if (index === q.correct) {
        buttons[index].classList.add('correct');
        score += 10;
        streak++;
        if (feedbackEl) {
            feedbackEl.textContent = '✓ Bonne réponse ! ' + q.feedback;
            feedbackEl.className = 'quiz-feedback correct';
            feedbackEl.style.display = 'block';
        }
    } else {
        buttons[index].classList.add('wrong');
        buttons[q.correct].classList.add('correct');
        streak = 0;
        if (feedbackEl) {
            feedbackEl.textContent = '✗ ' + q.feedback;
            feedbackEl.className = 'quiz-feedback wrong';
            feedbackEl.style.display = 'block';
        }
    }

    if (nextBtn) nextBtn.style.display = 'block';
    updateScoreDisplay();
}

function nextQuestion() {
    currentQuestion++;
    loadQuestion();
}

function updateScoreDisplay() {
    const scoreEl = document.getElementById('quiz-score');
    const streakEl = document.getElementById('quiz-streak');
    if (scoreEl) scoreEl.textContent = 'Score : ' + score + ' pts';
    if (streakEl) streakEl.textContent = 'Streak : ' + streak + (streak >= 2 ? ' 🔥' : '');
}

function showFinalScore() {
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const nextBtn = document.getElementById('next-btn');
    const progressEl = document.getElementById('quiz-progress-fill');

    if (progressEl) progressEl.style.width = '100%';
    if (questionEl) questionEl.textContent = `Quiz terminé ! Score : ${score} / ${QUESTIONS.length * 10} pts`;
    if (optionsEl) {
        optionsEl.innerHTML = `
            <button class="quiz-restart-btn" onclick="restartQuiz()">
                Recommencer
            </button>`;
    }
    if (nextBtn) nextBtn.style.display = 'none';
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    streak = 0;
    loadQuestion();
}

const nextBtn = document.getElementById('next-btn');
if (nextBtn) nextBtn.addEventListener('click', nextQuestion);

document.addEventListener('DOMContentLoaded', loadQuestion);
