import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { t, getCurrentLanguage } from '../data/translations';

const EnrollmentOverTimeGraph = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;
  
  console.log('EnrollmentOverTimeGraph received data:', data);
  console.log('Data keys:', Object.keys(data));
  console.log('First institution data:', Object.values(data)[0]);
  
  const [, forceUpdate] = useState({});
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('selectedLanguage') || 'en');
  
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = localStorage.getItem('selectedLanguage') || 'en';
      setCurrentLang(newLang);
      forceUpdate({});
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const formatNumber = (value) => {
    if (value === null || value === undefined) return '';
    
    console.log('formatNumber called with:', value, 'currentLang:', currentLang);
    
    if (currentLang === 'fr') {
      const formatted = new Intl.NumberFormat('fr-CA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
      console.log('French formatted:', formatted);
      return formatted;
    }
    
    const formatted = new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
    console.log('English formatted:', formatted);
    return formatted;
  };

  const allYears = new Set();
  Object.values(data).forEach(institutionData => {
    if (Array.isArray(institutionData)) {
      institutionData.forEach(item => allYears.add(item.year));
    } else {
      console.warn('institutionData is not an array:', institutionData);
    }
  });
  
  const sortedYears = Array.from(allYears).sort();
  
  const chartData = sortedYears.map(year => {
    const yearData = { year };
    Object.keys(data).forEach(institution => {
      if (Array.isArray(data[institution])) {
        const institutionYearData = data[institution].find(item => item.year === year);
        yearData[institution] = institutionYearData ? institutionYearData.total : null;
      } else {
        console.warn(`data[${institution}] is not an array:`, data[institution]);
        yearData[institution] = null;
      }
    });
    return yearData;
  });

  const colors = ['#192A51', '#3c86e2', '#E3655B', '#AAC0AF', '#FDCA40'];
  const institutions = Object.keys(data);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold mb-2">{t('tooltips.academicYear')}: {label}</p>
          {payload.map((entry, index) => (
            entry.value !== null && (
              <p key={index} className="mb-1" style={{ color: entry.color }}>
                {entry.dataKey}: {formatNumber(entry.value)}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  const getShortName = (name) => {
    return name.length > 25 ? name.substring(0, 22) + '...' : name;
  };

  return (
    <div className="card">
      <div className="card-header greyBackground">
        <h5 className="mb-0">{t('EnrollmentTrendsTitle')}</h5>
        <small className="text-muted">{t('EnrollmentTrendsDescription1')}<span className="accentText">
          {t('EnrollmentTrendsDescription2')}</span></small>
      </div>
      <div className="card-body whiteBackground">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            key={currentLang} 
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={formatNumber}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => getShortName(value)}
              wrapperStyle={{ fontSize: '12px' }}
            />
            {institutions.map((institution, index) => (
              <Line
                key={institution}
                type="monotone"
                dataKey={institution}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls={false}
                name={institution}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnrollmentOverTimeGraph;