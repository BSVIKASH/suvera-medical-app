import React, { useState } from 'react';

const MedicalApp = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [hospitals, setHospitals] = useState([]);

  // Language options
  const languages = [
    { value: 'english', label: 'English' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'telugu', label: 'Telugu' }
  ];

  // Handle language change
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  // Handle symptom input
  const handleSymptomChange = (e) => {
    setSymptomDescription(e.target.value);
  };

  // Search hospitals based on symptoms
  const searchHospitals = async () => {
    // Translate symptoms if not in English
    let symptomsToSearch = symptomDescription;
    
    if (selectedLanguage !== 'english') {
      symptomsToSearch = await translateSymptoms(symptomDescription, selectedLanguage, 'english');
    }

    // Fetch hospitals based on translated symptoms
    const relevantHospitals = await fetchHospitalsBySymptoms(symptomsToSearch);
    setHospitals(relevantHospitals);
  };

  return (
    <div className="medical-app">
      {/* Language Selector */}
      <div className="language-selector">
        <label>Select Language for Symptoms: </label>
        <select value={selectedLanguage} onChange={handleLanguageChange}>
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Symptom Description Box */}
      <div className="symptom-section">
        <h3>Describe Your Symptoms</h3>
        <textarea
          value={symptomDescription}
          onChange={handleSymptomChange}
          placeholder={`Describe symptoms in ${selectedLanguage}`}
          className="symptom-input"
          rows="4"
          cols="50"
        />
        <button onClick={searchHospitals}>Find Hospitals</button>
      </div>

      {/* Hospital Results */}
      <div className="hospital-results">
        <h3>Recommended Hospitals</h3>
        {hospitals.map(hospital => (
          <div key={hospital.id} className="hospital-card">
            <h4>{hospital.name}</h4>
            <p>{hospital.specialization}</p>
            <p>{hospital.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Translation function (you'll need to integrate with a translation API)
const translateSymptoms = async (text, fromLang, toLang) => {
  try {
    // Using Google Translate API or similar service
    const response = await fetch(`your-translation-api-endpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        source: fromLang,
        target: toLang
      })
    });
    
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

// Fetch hospitals based on symptoms
const fetchHospitalsBySymptoms = async (symptoms) => {
  // Your API call to backend to get relevant hospitals
  const response = await fetch(`/api/hospitals?search=${encodeURIComponent(symptoms)}`);
  const data = await response.json();
  return data.hospitals;
};

export default MedicalApp;