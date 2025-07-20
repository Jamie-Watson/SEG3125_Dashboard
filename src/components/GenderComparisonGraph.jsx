import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { t } from "../data/translations";
const GenderComparisonGraph = ({ data }) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map((item) => {
    const genderRatio = Math.abs((item.men / item.total) * 100 - 50);

    return {
      name: `${item.institution.substring(0, 15)}${
        item.institution.length > 15 ? "..." : ""
      } (${item.year})`,
      institution: item.institution,
      year: item.year,
      menCount: item.men,
      womenCount: item.women,
      totalCount: item.total,
      Men: ((item.men / item.total) * 100).toFixed(1),
      Women: ((item.women / item.total) * 100).toFixed(1),
      genderRatio: genderRatio,
    };
  });

  const mostBalanced = chartData.reduce((prev, current) =>
    prev.genderRatio < current.genderRatio ? prev : current
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isBalanced = data.name === mostBalanced.name;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1">Year: {data.year}</p>
          <div className="mb-2">
            <span className="fw-bold">
              Total Enrollment: {data.totalCount.toLocaleString()}
            </span>
          </div>
          <div className="mb-1">
            <span style={{ color: "#0d6efd" }}>
              Men: {data.menCount.toLocaleString()} ({data.Men}%)
            </span>
          </div>
          <div className="mb-0">
            <span style={{ color: "#dc3545" }}>
              Women: {data.womenCount.toLocaleString()} ({data.Women}%)
            </span>
          </div>
          {isBalanced && (
            <div className="mt-2 fw-bold fs-5">
              <small>Closest to 50/50 gender ratio</small>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">

          {mostBalanced?.institution && (
            <span className="accentText">{mostBalanced.institution}</span>
          )}
          {t("GenderDistributionTitle1")}
          <span className="accentText">{t("GenderDistributionTitle2")}</span>
          {t("GenderDistributionTitle3")}
        </h5>
        <small className="text-muted">
          {t("GenderDistributionDescription")}
        </small>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              fontSize={12}
            />
            <YAxis type="category" dataKey="name" width={100} fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Men" name={t('Men')} fill="#0d6efd">
              {chartData.map((entry, index) => {
                const isBalanced =
                  entry.institution === mostBalanced.institution;
                return (
                  <Cell
                    key={`cell-men-${index}`}
                    fill={isBalanced ? "#0d6efd" : "#72AAFE"}
                  />
                );
              })}
            </Bar>

            <Bar dataKey="Women" name={t('Women')} fill="#dc3545">
              {chartData.map((entry, index) => {
                const isBalanced =
                  entry.institution === mostBalanced.institution;
                return (
                  <Cell
                    key={`cell-women-${index}`}
                    fill={isBalanced ? "#dc3545" : "#F0A8AF"}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GenderComparisonGraph;
