import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentTypeComparisonGraph = ({ data }) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map(item => ({
    name: `${item.institution.substring(0, 15)}${item.institution.length > 15 ? '...' : ''} (${item.year})`,
    institution: item.institution,
    year: item.year,
    canadianCount: item.canadian,
    internationalCount: item.international,
    totalCount: item.total,
    Canadian: ((item.canadian / item.total) * 100).toFixed(1),
    International: ((item.international / item.total) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold mb-2">{data.institution}</p>
          <p className="mb-1">Year: {data.year}</p>
          <div className="mb-2">
            <span className="fw-bold">Total Students: {data.totalCount.toLocaleString()}</span>
          </div>
          <div className="mb-1">
            <span style={{ color: '#0d6efd' }}>Canadian: {data.canadianCount.toLocaleString()} ({data.Canadian}%)</span>
          </div>
          <div className="mb-0">
            <span style={{ color: '#fd7e14' }}>International: {data.internationalCount.toLocaleString()} ({data.International}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Student Type Distribution Comparison</h5>
        <small className="text-muted">Percentage distribution of Canadian vs International students (hover for total numbers)</small>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={120}
              fontSize={12}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="Canadian" 
              fill="#0d6efd"
              name="Canadian %"
            />
            <Bar 
              dataKey="International" 
              fill="#fd7e14"
              name="International %"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentTypeComparisonGraph;