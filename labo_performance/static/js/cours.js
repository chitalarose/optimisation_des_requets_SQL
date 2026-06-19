// ============================================
// COURS.JS - Filtres par niveau + copier le code SQL
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initLevelFilters();
    initCopyButtons();
});

// --- Filtrage des cours par niveau (page liste) ---
function initLevelFilters() {
    const buttons = document.querySelectorAll('.btn-filter');
    const cards = document.querySelectorAll('.course-card');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            cards.forEach(card => {
                const show = (filter === 'all') || (card.dataset.level === filter);
                card.style.display = show ? '' : 'none';
            });
        });
    });
}

// --- Copier le code SQL dans le presse-papier (page détail) ---
function initCopyButtons() {
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', async () => {
            const code = btn.parentElement.querySelector('code');
            if (!code) return;

            const text = code.textContent.trim();
            const original = btn.textContent;

            try {
                await navigator.clipboard.writeText(text);
                btn.textContent = '✅ Copié !';
            } catch (err) {
                btn.textContent = '❌ Erreur';
            }

            setTimeout(() => { btn.textContent = original; }, 1500);
        });
    });
}
