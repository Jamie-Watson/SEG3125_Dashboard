import React, { useEffect, useState } from 'react';
import { t, setLanguage, getCurrentLanguage, getAvailableLanguages } from '../data/translations';

function Navbar() {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const handleLanguageChange = () => forceUpdate({});
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);
  
  return (
    <nav className="navbar navbar-expand-lg navbar-light navbarContainer p-3">
      <div className="container-fluid d-flex flex-column">
        <div className="d-flex w-100 align-items-start mb-2">
          <div className="navbar-brand whiteText flex-grow-1 fs-5" style={{
            wordBreak: 'break-word',
          }}>
            {t('dashboardTitle')}
          </div>
          
          <div className="d-flex align-items-center flex-shrink-0">
            <i className="bi bi-globe2 whiteText me-1 fs-6"></i>
            <select 
              className="form-select form-select-md"
              value={getCurrentLanguage()}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {getAvailableLanguages().map(lang => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="w-100 d-block">
          <p className="whiteText mb-2 small d-block fs-6">
            {t('dashboardDescription')}
          </p>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;