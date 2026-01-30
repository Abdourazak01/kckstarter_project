// ============================================
// HANDLE FORM SUBMIT
// ============================================
function handleFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    console.log('🎯 handleFormSubmit appelée');

    // Ne rien faire ici - le addEventListener fera le travail
    return false;
}


// ============================================
// PARTICLES.JS CONFIGURATION
// ============================================
particlesJS('particles-js', {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#6C63FF'
        },
        shape: {
            type: 'circle'
        },
        opacity: {
            value: 0.5,
            random: false
        },
        size: {
            value: 3,
            random: true
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#6C63FF',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: 'grab'
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 140,
                line_linked: {
                    opacity: 1
                }
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
});

// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// NAVIGATION ACTIVE STATE
// ============================================
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ============================================
// FORM SUBMISSION
// ============================================
const predictionForm = document.getElementById('predictionForm');
const submitBtn = document.getElementById('submitBtn');
const resultsContainer = document.getElementById('resultsContainer');

if (predictionForm) {
    predictionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('📝 Formulaire soumis');

        // Désactiver le bouton et afficher le chargement
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Analyse en cours...';

        // Récupérer les données du formulaire
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

        console.log('📊 Données du formulaire:', formData);

        try {
            // Envoyer la requête au serveur
            console.log('🚀 Envoi de la requête au serveur...');
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('📡 Réponse reçue:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur serveur');
            }

            const data = await response.json();
            console.log('📦 Données reçues:', data);

            if (data.success) {
                console.log('✅ Prédiction réussie, affichage des résultats');
                displayResults(data);
            } else {
                console.error('❌ Erreur dans la réponse:', data.error);
                alert('Erreur: ' + data.error);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la requête:', error);
            alert('Une erreur est survenue lors de la prédiction: ' + error.message);
        } finally {
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
} else {
    console.error('❌ Formulaire non trouvé!');
}

// ============================================
// DISPLAY RESULTS
// ============================================
function displayResults(data) {
    console.log('🎨 Affichage des résultats:', data);

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
// GENERATE TIPS
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
// CLOSE RESULTS
// ============================================
function closeResults() {
    console.log('❌ Fermeture du popup de résultats');
    resultsContainer.style.display = 'none';
}

// Fermer avec la touche Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resultsContainer.style.display === 'flex') {
        closeResults();
    }
});

// ============================================
// FORM VALIDATION
// ============================================
const inputs = document.querySelectorAll('input, select');

inputs.forEach(input => {
    input.addEventListener('invalid', (e) => {
        e.preventDefault();
        input.style.borderColor = '#FF4757';
    });

    input.addEventListener('input', () => {
        input.style.borderColor = '';
    });
});

// ============================================
// AUTO-FILL USD GOAL
// ============================================
const goalInput = document.getElementById('goal');
const usdGoalInput = document.getElementById('usd_goal_real');
const currencySelect = document.getElementById('currency');

// Taux de change approximatifs
const exchangeRates = {
    'USD': 1,
    'EUR': 1.08,
    'GBP': 1.27,
    'CAD': 0.74,
    'AUD': 0.66,
    'SEK': 0.096,
    'NOK': 0.093,
    'DKK': 0.145,
    'CHF': 1.13,
    'MXN': 0.058
};

function updateUsdGoal() {
    const goal = parseFloat(goalInput.value) || 0;
    const currency = currencySelect.value;
    const rate = exchangeRates[currency] || 1;
    const usdGoal = goal * rate;
    usdGoalInput.value = Math.round(usdGoal);
}

if (goalInput && usdGoalInput && currencySelect) {
    goalInput.addEventListener('input', updateUsdGoal);
    currencySelect.addEventListener('change', updateUsdGoal);
}

console.log('🚀 Kickstarter Predictor App initialized successfully!');
```

---

## ✅ **ÉTAPES POUR TESTER**

1. **Remplacez complètement** vos fichiers `index.html` et `script.js` par ces versions
2. **Sauvegardez** les fichiers
3. **Arrêtez Flask** (`Ctrl + C` dans le terminal)
4. **Relancez Flask** : `python app.py`
5. **Ouvrez le navigateur** et allez sur `http://127.0.0.1:5000`
6. **Rechargez la page** avec `Ctrl + F5` (force le rechargement complet)
7. **Ouvrez la console** (`F12`)
8. **Remplissez le formulaire** et cliquez sur "Prédire le Succès"

---

## 🎯 **CE QUE VOUS DEVEZ VOIR**

### Dans la **Console** (F12) :
```
🚀 Kickstarter Predictor App initialized successfully!
📝 Formulaire soumis
📊 Données du formulaire: {main_category: "Technology", currency: "USD", ...}
🚀 Envoi de la requête au serveur...
📡 Réponse reçue: 200
📦 Données reçues: {success: true, prediction: "successful", probability: 75.5, ...}
✅ Prédiction réussie, affichage des résultats
🎨 Affichage des résultats: {...}
👁️ Affichage du popup de résultats
```

### Dans les **Logs Flask** :
```
127.0.0.1 - - [30/Jan/2026 11:30:00] "POST /predict HTTP/1.1" 200 -