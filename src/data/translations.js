const translations = {
  en: {
    dashboardTitle: "University Data",
    dashboardDescription: "A summary of Canadian university enrollment data by program, gender, student origin, and year",
    buttons: {
      submit: "Submit",
      cancel: "Cancel"
    }
  },
  fr: {
    dashboardTitle: "Données Universitaires", 
    dashboardDescription: "Un résumé des données d'inscription des universités canadiennes par programme, genre, origine des étudiants et année",
    buttons: {
      submit: "Soumettre",
      cancel: "Annuler"
    }
  }
  
};

let currentLang = 'fr';

export const t = (key, params = {}) => {
  const keys = key.split('.');
  let value = translations[currentLang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (!value) return key;
  
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, paramName) => {
      return params[paramName] || match;
    });
  }
  
  return value;
};

export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLang = lang;
    window.dispatchEvent(new CustomEvent('languageChange'));
  }
};

export const getCurrentLanguage = () => currentLang;

export const getAvailableLanguages = () => Object.keys(translations);