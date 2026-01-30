// ============================================
// DISPLAY RESULTS FUNCTION
// ============================================
function displayResults(data) {
    console.log('🎨 Affichage des résultats:', data);

    const resultsContainer = document.getElementById('resultsContainer');
    const resultIcon = document.getElementById('resultIcon');
    const resultPrediction = document.getElementById('resultPrediction');
    const probabilityFill = document.getElementById('probabilityFill');
    const probabilityValue = document.getElementById('probabilityValue');
    const confidenceBadge = document.getElementById('confidenceBadge');
    const confidenceText = document.getElementById('confidenceText');
    const resultTips = document.getElementById('resultTips');

    // Déterminer si c'est un succès ou un échec
    const isSuccess = data.prediction === 'successful';

    console.log('🎯 Prédiction:', data.prediction, '| Succès:', isSuccess);

    // Mettre à jour l'icône
    resultIcon.className = 'result-icon ' + (isSuccess ? 'success' : 'failure');
    resultIcon.innerHTML = isSuccess ?
        '<i class="fas fa-check-circle"></i>' :
        '<i class="fas fa-times-circle"></i>';

    // Mettre à jour la prédiction
    resultPrediction.className = 'result-prediction ' + (isSuccess ? 'success' : 'failure');
    resultPrediction.textContent = isSuccess ?
        '✨ Projet Prometteur !' :
        '⚠️ Risque Élevé';

    // Mettre à jour la barre de probabilité avec animation
    setTimeout(() => {
        probabilityFill.style.width = data.probability + '%';
    }, 100);
    probabilityValue.textContent = data.probability + '%';

    // Mettre à jour le badge de confiance
    const confidenceLevel = data.confidence === 'Élevée' ? 'high' :
                           data.confidence === 'Moyenne' ? 'medium' : 'low';
    confidenceBadge.className = 'confidence-badge ' + confidenceLevel;
    confidenceText.textContent = 'Confiance: ' + data.confidence;

    // Générer des conseils
    const tips = generateTips(data.prediction, data.probability);
    resultTips.innerHTML = `
        <h4><i class="fas fa-lightbulb"></i> Recommandations</h4>
        <ul>
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
    `;

    // Afficher le conteneur de résultats
    console.log('👁️ Affichage du popup de résultats');
    resultsContainer.style.display = 'flex';

    // Scroll vers le haut pour voir le popup
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// GENERATE TIPS FUNCTION
// ============================================
function generateTips(prediction, probability) {
    if (prediction === 'successful') {
        if (probability >= 75) {
            return [
                'Excellentes chances de succès ! Continuez comme ça.',
                'Assurez-vous d\'avoir une communication claire avec vos backers.',
                'Préparez une stratégie de marketing solide avant le lancement.',
                'Créez du contenu engageant (vidéos, images, story-telling).'
            ];
        } else {
            return [
                'Bonnes chances de succès, mais il y a des améliorations possibles.',
                'Augmentez votre présence sur les réseaux sociaux.',
                'Offrez des récompenses attractives à différents niveaux.',
                'Engagez votre communauté avant le lancement officiel.'
            ];
        }
    } else {
        if (probability < 25) {
            return [
                'Chances de succès faibles. Revoyez votre stratégie.',
                'Réduisez votre objectif financier si possible.',
                'Améliorez la présentation de votre projet (vidéo, images).',
                'Construisez une communauté avant de lancer la campagne.',
                'Considérez une campagne plus courte (moins de 30 jours).'
            ];
        } else {
            return [
                'Chances modérées. Quelques ajustements pourraient aider.',
                'Augmentez le nombre de contributeurs potentiels.',
                'Optimisez votre page de campagne avec du contenu de qualité.',
                'Planifiez une stratégie de communication régulière.',
                'Offrez des early bird rewards pour stimuler les premières contributions.'
            ];
        }
    }
}

// ============================================
// CLOSE RESULTS FUNCTION
// ============================================
function closeResults() {
    console.log('❌ Fermeture du popup de résultats');
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'none';
}

// Fermer avec la touche Escape
document.addEventListener('keydown', (e) => {
    const resultsContainer = document.getElementById('resultsContainer');
    if (e.key === 'Escape' && resultsContainer.style.display === 'flex') {
        closeResults();
    }
});

// ============================================
// FORM SUBMISSION HANDLER
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Form handler chargé');

    const form = document.getElementById('predictionForm');

    if (!form) {
        console.error('❌ Formulaire non trouvé!');
        return;
    }

    console.log('✅ Formulaire trouvé');

    // Supprimer tous les event listeners existants
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    // Ajouter le nouvel event listener
    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log('✅ FORMULAIRE INTERCEPTÉ !');

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Analyse en cours...';

        const formData = {
            main_category: document.getElementById('main_category').value,
            currency: document.getElementById('currency').value,
            country: document.getElementById('country').value,
            goal: parseFloat(document.getElementById('goal').value),
            backers: parseInt(document.getElementById('backers').value),
            usd_goal_real: parseFloat(document.getElementById('usd_goal_real').value),
            campaign_days: parseInt(document.getElementById('campaign_days').value),
            launch_year: parseInt(document.getElementById('launch_year').value),
            launch_month: parseInt(document.getElementById('launch_month').value),
            launch_day: parseInt(document.getElementById('launch_day').value),
            launch_weekday: parseInt(document.getElementById('launch_weekday').value),
            goal_category: document.getElementById('goal_category').value
        };

        console.log('📊 Données:', formData);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('📡 Réponse:', response.status);

            const data = await response.json();
            console.log('📦 Data:', data);

            if (data.success) {
                displayResults(data);
            } else {
                alert('Erreur: ' + data.error);
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert('Erreur: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }

        return false;
    }, true);

    console.log('✅ Event listener ajouté');
});