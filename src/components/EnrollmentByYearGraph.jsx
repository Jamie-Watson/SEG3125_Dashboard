import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { t } from '../data/translations';

const EnrollmentByYearGraph = ({ data }) => {
  if (!data || data.length === 0) return null;

  const [, forceUpdate] = useState({});
  const [largestInstitution, setLargestInstitution] = useState('');

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const { chartData, maxValue } = useMemo(() => {
    let maxEnrollment = 0;
    let topInstitution = '';

    data.forEach(item => {
      const enrollment = parseInt(item.total) || 0;
      if (enrollment > maxEnrollment) {
        maxEnrollment = enrollment;
        topInstitution = item.institution;
      }
    });

    setLargestInstitution(topInstitution);

    const formatted = data.map(item => {
      const enrollment = parseInt(item.total) || 0;
      const name = `${item.institution.substring(0, 20)}${item.institution.length > 20 ? '...' : ''} (${item.year})`;

      return {
        name,
        institution: item.institution,
        year: item.year,
        total: enrollment,
        isLargest: item.institution === topInstitution
      };
    });

    return { 
      chartData: formatted, 
      maxValue: Math.ceil(maxEnrollment * 1.1)
    };
  }, [data]);

  const formatNumber = (value) => {
    const currentLang = localStorage.getItem('language') || 'en';
    const locale = currentLang === 'fr' ? 'fr-FR' : 'en-US';
    return parseInt(value).toLocaleString(locale);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold mb-1">{data.institution}</p>
          <p className="mb-1">Year: {data.year}</p>
          <p className="mb-0 text-primary">
            Total Enrollment: {formatNumber(data.total)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <span className="accentText">{largestInstitution}</span> {t('EnrollmentTitle1')}
          <span className="accentText">{t('EnrollmentTitle2')}</span>
          {t('EnrollmentTitle3')}
        </h5>
        <small className="text-muted">{t('EnrollmentByYearDescription')}</small>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              domain={[0, maxValue]}
              tickFormatter={formatNumber}
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              fontSize={10}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="total"
              name="Total Enrollment"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isLargest ? "#3c86e2" : "#c7c7c8"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnrollmentByYearGraph;