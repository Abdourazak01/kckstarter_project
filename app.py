from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

app = Flask(__name__)

# Charger le modèle et les ressources
try:
    model = joblib.load('best_kickstarter_model.pkl')
    scaler = joblib.load('scaler.pkl')
    label_encoders = joblib.load('label_encoders.pkl')
    le_state = joblib.load('label_encoder_state.pkl')
    feature_names = joblib.load('feature_names.pkl')
    model_info = joblib.load('model_info.pkl')
    print("✅ Modèle et ressources chargés avec succès!")
except Exception as e:
    print(f"❌ Erreur lors du chargement du modèle: {e}")
    model = None

# Listes pour les dropdowns
MAIN_CATEGORIES = [
    'Film & Video', 'Music', 'Publishing', 'Games', 'Technology',
    'Design', 'Art', 'Food', 'Fashion', 'Theater', 'Comics',
    'Photography', 'Crafts', 'Journalism', 'Dance'
]

CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'SEK', 'NOK', 'DKK', 'CHF', 'MXN']

COUNTRIES = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'IE', 'NZ', 'AT', 'BE', 'CH', 'LU',
             'HK', 'SG', 'MX']

GOAL_CATEGORIES = ['très_faible', 'faible', 'moyen', 'élevé', 'très_élevé']

MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

WEEKDAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']


@app.route('/')
def home():
    """Page d'accueil"""
    return render_template('index.html',
                           categories=MAIN_CATEGORIES,
                           currencies=CURRENCIES,
                           countries=COUNTRIES,
                           goal_categories=GOAL_CATEGORIES,
                           months=MONTHS,
                           weekdays=WEEKDAYS,
                           model_info=model_info if model else None)


@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint de prédiction"""
    try:
        # Récupérer les données du formulaire
        data = request.get_json()

        # Créer un dictionnaire avec les données
        input_data = {
            'main_category': data['main_category'],
            'currency': data['currency'],
            'country': data['country'],
            'goal': float(data['goal']),
            'backers': int(data['backers']),
            'usd_goal_real': float(data['usd_goal_real']),
            'campaign_days': int(data['campaign_days']),
            'launch_year': int(data['launch_year']),
            'launch_month': int(data['launch_month']),
            'launch_day': int(data['launch_day']),
            'launch_weekday': int(data['launch_weekday']),
            'goal_category': data['goal_category']
        }

        # Créer un DataFrame
        df_input = pd.DataFrame([input_data])

        # Encoder les variables catégorielles
        for col, le in label_encoders.items():
            if col in df_input.columns:
                try:
                    df_input[col] = le.transform(df_input[col].astype(str))
                except:
                    # Si la valeur n'existe pas, utiliser la première valeur connue
                    df_input[col] = 0

        # Assurer que toutes les features sont présentes
        for feature in feature_names:
            if feature not in df_input.columns:
                df_input[feature] = 0

        # Réorganiser les colonnes dans le bon ordre
        df_input = df_input[feature_names]

        # Normaliser
        X_scaled = scaler.transform(df_input)

        # Prédire
        prediction = model.predict(X_scaled)[0]
        probability = model.predict_proba(X_scaled)[0]

        # Décoder la prédiction
        prediction_label = le_state.inverse_transform([prediction])[0]
        success_probability = float(probability[1] * 100)

        # Préparer la réponse
        response = {
            'success': True,
            'prediction': prediction_label,
            'probability': round(success_probability, 2),
            'confidence': 'Élevée' if max(probability) > 0.7 else 'Moyenne' if max(probability) > 0.5 else 'Faible'
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/about')
def about():
    """Page à propos du modèle"""
    return jsonify({
        'model_name': model_info['model_name'] if model_info else 'N/A',
        'accuracy': f"{model_info['accuracy']:.2%}" if model_info else 'N/A',
        'roc_auc': f"{model_info['roc_auc']:.4f}" if model_info else 'N/A',
        'date_trained': model_info['date_trained'] if model_info else 'N/A'
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)