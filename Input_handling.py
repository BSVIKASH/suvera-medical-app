import re
import nltk
from deep_translator import GoogleTranslator
from langdetect import detect
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from difflib import SequenceMatcher

# NLTK setup
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

lemmatizer = WordNetLemmatizer()
english_stopwords = set(stopwords.words('english'))

# -----------------------------------------------------------
# 1. SYMPTOM MASTER LISTS
# -----------------------------------------------------------

CRITICAL_SYMPTOMS = [
    # Cardiovascular
    "heart pain", "chest pain", "left arm pain", "fainting", "unconscious",
    "stroke", "sudden paralysis", "slurred speech", "severe headache", "loss of vision",
    # Respiratory
    "shortness of breath", "breathing difficulty", "no breathing", "severe wheezing",
    "choking", "blue lips", "blue face",
    # Bleeding & Trauma
    "blood vomiting", "severe bleeding", "internal bleeding", "gunshot wound",
    "deep stab wound", "severe burns", "major accident injury",
    # Neurological
    "seizure", "convulsions", "loss of consciousness", "coma",
    "confusion", "sudden inability to move",
    # GI & Infections
    "severe abdominal pain", "black stool", "blood in stool",
    "persistent vomiting", "vomiting blood", "severe dehydration",
    # Allergic
    "anaphylaxis", "swelling of face or throat", "high fever with rash",
    # Obstetric & Pediatric
    "heavy pregnancy bleeding", "labor complications", "newborn not breathing",
    # General Critical Signs
    "shock", "cold clammy skin", "extreme weakness", "unable to wake up",
    "sudden collapse"
]

NORMAL_SYMPTOMS = [
    "headache", "fever", "cough", "stomach pain", "back pain",
    "joint pain", "cold", "nausea", "dizziness", "vomiting", "diarrhea"
]

# -----------------------------------------------------------
# 2. DEPARTMENT MAPPING
# -----------------------------------------------------------

CRITICAL_DEPT_MAP = {
    "heart pain": "Cardiology",
    "chest pain": "Cardiology",
    "shortness of breath": "Pulmonology",
    "breathing difficulty": "Pulmonology",
    "stroke": "Neurology",
    "unconscious": "Neurology",
    "slurred speech": "Neurology",
    "sudden paralysis": "Neurology",
    "blood vomiting": "Gastroenterology",
    "severe bleeding": "Emergency",
    "left arm pain": "Cardiology",
    "fainting": "Cardiology"
}

DOCTOR_MAP = {
    "Cardiology": "Cardiologist",
    "Pulmonology": "Pulmonologist",
    "Neurology": "Neurologist",
    "Gastroenterology": "Gastroenterologist",
    "Nephrology": "Nephrologist",
    "Endocrinology": "Endocrinologist",
    "Orthopedics": "Orthopedic Surgeon",
    "Dermatology": "Dermatologist",
    "ENT": "ENT Specialist",
    "Gynecology": "Gynecologist",
    "Psychiatry": "Psychiatrist",
    "Infectious Diseases": "Infectious Diseases Specialist",
    "Emergency": "Emergency Physician",
    "General": "General Physician"
}

# -----------------------------------------------------------
# 3. DISEASE MAP
# -----------------------------------------------------------

DISEASE_MAP = {
    "Neurology": [
        ("sudden paralysis", "Paralysis - Stroke"),
        ("slurred speech", "Stroke"),
        ("severe headache", "Migraine"),
        ("loss of vision", "Optic Neuritis"),
        ("seizure", "Epilepsy")
    ],
    "Cardiology": [
        ("chest pain", "Possible Heart Attack"),
        ("heart pain", "Angina"),
        ("left arm pain", "Heart Attack Indicator"),
        ("fainting", "Cardiac Syncope")
    ],
    "Pulmonology": [
        ("shortness of breath", "Asthma Attack"),
        ("breathing difficulty", "COPD Exacerbation"),
        ("blood vomiting", "Lung Cancer / TB")
    ],
    "Gastroenterology": [
        ("blood vomiting", "Upper GI Bleed"),
        ("stomach pain", "Gastric Ulcer"),
        ("diarrhea", "Gastroenteritis")
    ],
    "Emergency": [
        ("severe bleeding", "Major Trauma"),
        ("unconscious", "Emergency Shock")
    ]
}

# -----------------------------------------------------------
# 4. LANGUAGE & TRANSLATION
# -----------------------------------------------------------

def detect_language(text: str) -> str:
    try:
        return detect(text)
    except:
        return "en"

def translate_to_english(text: str, lang: str) -> str:
    if lang == "en":
        return text
    try:
        return GoogleTranslator(source='auto', target='en').translate(text)
    except:
        return text

# -----------------------------------------------------------
# 5. TEXT PREPROCESSING
# -----------------------------------------------------------

def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def extract_symptoms(text: str):
    text = preprocess_text(text)
    parts = re.split(r'\band\b|,|with|மற்றும்|உடன்', text)
    return [p.strip() for p in parts if p.strip()]

# -----------------------------------------------------------
# 6. FUZZY MATCHER
# -----------------------------------------------------------

def is_match(symptom, keyword, threshold=0.6):
    symptom = symptom.lower()
    keyword = keyword.lower()
    if keyword in symptom:  # substring match
        return True
    score = SequenceMatcher(None, symptom, keyword).ratio()
    return score >= threshold

# -----------------------------------------------------------
# 7. CLASSIFIER (ONE CRITICAL → CRITICAL)
# -----------------------------------------------------------

def classify_symptoms(symptoms):
    classified = {"Critical": [], "Normal": []}

    for s in symptoms:
        found_critical = False
        for keyword in CRITICAL_SYMPTOMS:
            if is_match(s, keyword):
                classified["Critical"].append(s)
                found_critical = True
                break
        if not found_critical:
            classified["Normal"].append(s)

    return classified

# -----------------------------------------------------------
# 8. MAP CRITICAL SYMPTOMS TO DEPARTMENTS
# -----------------------------------------------------------

def categorize_critical_symptoms(symptoms):
    output = {}
    for s in symptoms:
        matched = False
        for key, dept in CRITICAL_DEPT_MAP.items():
            if is_match(s, key):
                output.setdefault(dept, []).append(s)
                matched = True
                break
        if not matched:
            output.setdefault("Emergency", []).append(s)
    return output

# -----------------------------------------------------------
# 9. PREDICT DISEASE + DOCTOR
# -----------------------------------------------------------

def predict_disease_and_doctor(dept_categories):
    if not dept_categories:
        return {
            "top_department": "Emergency",
            "disease_prediction": "Unidentified Emergency Condition",
            "recommended_doctor": "Emergency Physician"
        }

    top_dept = max(dept_categories, key=lambda d: len(dept_categories[d]))
    predicted = "Unidentified Emergency Condition"

    if top_dept in DISEASE_MAP:
        for symptom in dept_categories[top_dept]:
            for keyword, disease in DISEASE_MAP[top_dept]:
                if is_match(symptom, keyword):
                    predicted = disease
                    break

    return {
        "top_department": top_dept,
        "disease_prediction": predicted,
        "recommended_doctor": DOCTOR_MAP.get(top_dept, "General Physician")
    }

# -----------------------------------------------------------
# 10. MAIN PIPELINE
# -----------------------------------------------------------

def medical_pipeline(user_text: str):
    lang = detect_language(user_text)
    english_text = translate_to_english(user_text, lang)

    symptoms = extract_symptoms(english_text)
    classification = classify_symptoms(symptoms)

    # FORCE CRITICAL CASE IF ANY CRITICAL SYMPTOM EXISTS
    if classification["Critical"]:
        final_status = "Critical"
        dept_categories = categorize_critical_symptoms(classification["Critical"])
        disease_info = predict_disease_and_doctor(dept_categories)
    else:
        final_status = "Normal"
        dept_categories = {}
        disease_info = {
            "top_department": "General",
            "disease_prediction": "Common Illness",
            "recommended_doctor": "General Physician"
        }

    return {
        "original_text": user_text,
        "language_detected": lang,
        "english_text": english_text,
        "symptoms": symptoms,
        "classification": classification,
        "final_status": final_status,
        "critical_departments": dept_categories,
        "disease_info": disease_info
    }
