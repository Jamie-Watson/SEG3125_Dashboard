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
import { useEffect, useState } from "react";

const GenderComparisonGraph = ({ data }) => {
  const [, forceUpdate] = useState({});
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );

  if (!data || data.length === 0) return null;

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = localStorage.getItem("selectedLanguage") || "en";
      setCurrentLang(newLang);
      forceUpdate({});
    };

    window.addEventListener("languageChange", handleLanguageChange);
    return () =>
      window.removeEventListener("languageChange", handleLanguageChange);
  }, []);

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "";

    if (currentLang === "fr") {
      return new Intl.NumberFormat("fr-CA", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }

    return new Intl.NumberFormat("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return "";

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return "";

    if (currentLang === "fr") {
      return (
        new Intl.NumberFormat("fr-CA", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(numericValue) + " %"
      );
    }

    return (
      new Intl.NumberFormat("en-CA", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(numericValue) + "%"
    );
  };

  const formatAxisPercentage = (value) => {
    if (currentLang === "fr") {
      return `${value} %`;
    }
    return `${value}%`;
  };

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
      const isBalanced = data.institution === mostBalanced.institution && data.year === mostBalanced.year;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1">
            {t("tooltips.year")}: {data.year}
          </p>
          <div className="mb-2">
            <span className="fw-bold">
              {t("tooltips.enrollment")}: {formatNumber(data.totalCount)}
            </span>
          </div>
          <div className="mb-1">
            <span style={{ color: "#0d6efd" }}>
              {t("tooltips.men")}: {formatNumber(data.menCount)} (
              {formatPercentage(data.Men)})
            </span>
          </div>
          <div className="mb-0">
            <span style={{ color: "#dc3545" }}>
              {t("tooltips.women")}: {formatNumber(data.womenCount)} (
              {formatPercentage(data.Women)})
            </span>
          </div>
          {isBalanced && (
            <div className="mt-2 fw-bold fs-5">
              <small>{t("tooltips.genderRatio")}</small>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header greyBackground">
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
      <div className="card-body whiteBackground">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            key={currentLang}
            layout="vertical"
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid horizontal={false} vertical={true} strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={formatAxisPercentage}
              fontSize={12}
            />
            <YAxis type="category" dataKey="name" width={100} fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Men" name={t("Men")} fill="#0d6efd">
              {chartData.map((entry, index) => {
                const isBalanced =
                  entry.institution === mostBalanced.institution && entry.year === mostBalanced.year;
                return (
                  <Cell
                    key={`cell-men-${index}`}
                    fill={isBalanced ? "#0d6efd" : "#72AAFE"}
                  />
                );
              })}
            </Bar>

            <Bar dataKey="Women" name={t("Women")} fill="#dc3545">
              {chartData.map((entry, index) => {
                const isBalanced =
                  entry.institution === mostBalanced.institution && entry.year === mostBalanced.year;
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