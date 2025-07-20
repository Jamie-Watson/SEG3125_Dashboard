import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { t } from '../data/translations';

const EnrollmentOverTimeGraph = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const [, forceUpdate] = useState({});
  
    useEffect(() => {
      const handleLanguageChange = () => {
        forceUpdate({});
      };
  
      window.addEventListener('languageChange', handleLanguageChange);
      return () => window.removeEventListener('languageChange', handleLanguageChange);
    }, []);

  const allYears = new Set();
  Object.values(data).forEach(institutionData => {
    institutionData.forEach(item => allYears.add(item.year));
  });
  
  const sortedYears = Array.from(allYears).sort();
  
  const chartData = sortedYears.map(year => {
    const yearData = { year };
    Object.keys(data).forEach(institution => {
      const institutionYearData = data[institution].find(item => item.year === year);
      yearData[institution] = institutionYearData ? institutionYearData.total : null;
    });
    return yearData;
  });

  const colors = ['#192A51', '#3c86e2', '#E3655B', '#AAC0AF', '#FDCA40'];
  const institutions = Object.keys(data);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold mb-2">Academic Year: {label}</p>
          {payload.map((entry, index) => (
            entry.value !== null && (
              <p key={index} className="mb-1" style={{ color: entry.color }}>
                {entry.dataKey}: {entry.value.toLocaleString()}
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
      <div className="card-header">
        <h5 className="mb-0">{t('EnrollmentTrendsTitle')}</h5>
        <small className="text-muted">{t('EnrollmentTrendsDescription1')}<span className="accentText">
          {t('EnrollmentTrendsDescription2')}</span></small>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
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
              tickFormatter={(value) => value.toLocaleString()}
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