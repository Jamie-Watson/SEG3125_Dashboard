import StudentTypeComparisonGraph from "../components/StudentTypeComparisonGraph";

const translations = {
  en: {
    dashboardTitle: "University Data",
    dashboardDescription: "A summary of Canadian university enrollment data by program, gender, student origin, and year",
    selector: "University Enrollment Data Selector",
    yearLabel: "Select Year",
    yearPlaceholder: "Choose a year...",
    institutionLabel: "Select Institution",
    institutionPlaceholder: "Choose an institution...",
    selections: "Selections:",
    activeSelectionsLabel: "Active Selections",
    noActiveSelections: "No selections yet. Use the form above to add up to 5 combinations.",
    EnrollmentByYearDescription: "Total enrollment for each selected institution-year combination",
    EnrollmentTitle1: " has the",
    EnrollmentTitle2: " largest enrollment",
    EnrollmentTitle3: " in the selected years",
    EnrollmentTrendsTitle: "Enrollment Trends Over Time",
    EnrollmentTrendsDescription1: "Total enrollment trends for selected institutions across ",
    EnrollmentTrendsDescription2: "all available years",
    GenderDistributionTitle1: " has the",
    GenderDistributionTitle2: " most balanced gender distribution",
    GenderDistributionTitle3: " in the selected years",
    GenderDistributionDescription: "Percentage distribution of Men vs Women",
    StudentTypeComparisonTitle1: " has the",
    StudentTypeComparisonTitle2: " highest percentage of international students",
    StudentTypeComparisonTitle3: " in the selected years",
    StudentTypeComparison: "Percentage distribution of Canadian vs International students",

    Men: "Men %",
    Women: "Women %",
    Canadian: "Canadian %",
    International: "International %",
    tooltips: {
      enrollment: "Total Enrollment",
      year: "Year",
      academicYear: "Academic Year",
      men: "Men",
      women: "Women",
      genderRatio: "Closest to 50/50 gender ratio",
      canadian: "Canadian",
      international: "International",
      internationalRatio: "Highest percentage of international students"
    },
    buttons: {
      add: "Add",
    },
    alerts: {
      selectBoth: "Please select both a year and an institution",
      maxSelections: "Maximum of 5 selections allowed",
      alreadySelected: "This combination is already selected"
    }
  },
  fr: {
    dashboardTitle: "Données Universitaires",
    dashboardDescription: "Un résumé des données d'inscription des universités canadiennes par programme, genre, origine des étudiants et année",
    selector: "Sélecteur de données d'inscription universitaire",
    yearLabel: "Sélectionner l'année",
    yearPlaceholder: "Choisir une année...",
    institutionLabel: "Sélectionner l'institution",
    institutionPlaceholder: "Choisir une institution...",
    selections: "Sélections:",
    activeSelectionsLabel: "Sélections Actives",
    noActiveSelections: "Aucune sélection pour le moment. Utilisez le formulaire ci-dessus pour ajouter jusqu'à 5 combinaisons.",
    EnrollmentByYearDescription: "Inscription totale pour chaque combinaison institution-année sélectionnée",
    EnrollmentTitle1: " a la",
    EnrollmentTitle2: " plus grande inscription",
    EnrollmentTitle3: " dans les années sélectionnées",
    EnrollmentTrendsTitle: "Tendances d'inscription au fil du temps",
    EnrollmentTrendsDescription1: "Tendances d'inscription totale pour les institutions sélectionnées à travers ",
    EnrollmentTrendsDescription2: "toutes les années disponibles",
    GenderDistributionTitle1: " a la",
    GenderDistributionTitle2: " distribution de genre la plus équilibrée",
    GenderDistributionTitle3: " dans les années sélectionnées",
    GenderDistributionDescription: "Distribution en pourcentage des hommes et des femmes",
    StudentTypeComparisonTitle1: " a le",
    StudentTypeComparisonTitle2: " plus grand pourcentage d'étudiants internationaux",
    StudentTypeComparisonTitle3: " dans les années sélectionnées",
    StudentTypeComparison: "Distribution en pourcentage des Canadiens et des Internationaux",
    Men: "Hommes %",
    Women: "Femmes %",
    Canadian: "Canadiens %",
    International: "Internationaux %",
    tooltips: {
      enrollment: "Inscription Totale",
      year: "Année",
      academicYear: "Année Académique",
      men: "Hommes",
      women: "Femmes",
      genderRatio: "Le plus proche de la répartition 50/50",
      canadian: "Canadiens",
      international: "Internationaux",
      internationalRatio: "Le plus grand pourcentage d'étudiants internationaux"
    },
    buttons: {
      add: "Ajouter",
    },
    alerts: {
      selectBoth: "Veuillez sélectionner une année et une institution",
      maxSelections: "Maximum de 5 sélections autorisées",
      alreadySelected: "Cette combinaison est déjà sélectionnée"
    }
  }
};

let currentLang = localStorage.getItem('selectedLanguage') || 'en';

if (!translations[currentLang]) {
  currentLang = 'en';
}

export const t = (key, params = {}) => {
  const lang = getCurrentLanguage();
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (!value && lang !== 'en') {
    let fallbackValue = translations.en;
    for (const k of keys) {
      fallbackValue = fallbackValue?.[k];
    }
    value = fallbackValue;
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
  if (translations[lang] && lang !== currentLang) {
    currentLang = lang;
    localStorage.setItem('selectedLanguage', lang);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
    }, 0);
  }
};

export const getCurrentLanguage = () => currentLang;
export const getAvailableLanguages = () => Object.keys(translations);