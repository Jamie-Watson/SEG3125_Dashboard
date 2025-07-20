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
import { useEffect, useState } from "react";
import { t } from "../data/translations";

const StudentTypeComparisonGraph = ({ data }) => {
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

  const chartData = data.map((item) => ({
    name: `${item.institution.substring(0, 15)}${
      item.institution.length > 15 ? "..." : ""
    } (${item.year})`,
    institution: item.institution,
    year: item.year,
    canadianCount: item.canadian,
    internationalCount: item.international,
    totalCount: item.total,
    Canadian: ((item.canadian / item.total) * 100).toFixed(1),
    International: ((item.international / item.total) * 100).toFixed(1),
  }));

  const mostInternational = chartData.reduce((prev, current) =>
    prev.internationalCount > current.internationalCount ? prev : current
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isHighestInternational = data.institution === mostInternational.institution && data.year === mostInternational.year;
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
              {t("tooltips.canadian")}: {formatNumber(data.canadianCount)} (
              {formatPercentage(data.Canadian)})
            </span>
          </div>
          <div className="mb-0">
            <span style={{ color: "#fd7e14" }}>
              {t("tooltips.international")}:{" "}
              {formatNumber(data.internationalCount)} (
              {formatPercentage(data.International)})
            </span>
          </div>
          {isHighestInternational && (
            <div className="mt-2 fw-bold fs-5">
              <small>{t("tooltips.internationalRatio")}</small>
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
          <span className="accentText">{mostInternational.institution}</span>
          {t("StudentTypeComparisonTitle1")}
          <span className="accentText">{t("StudentTypeComparisonTitle2")}</span>
          {t("StudentTypeComparisonTitle3")}
        </h5>
        <small className="text-muted">{t("StudentTypeComparison")}</small>
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
            <Bar dataKey="Canadian" name={t("Canadian")} fill="#0d6efd">
              {chartData.map((entry, index) => {
                const isHighestInternational =
                  entry.institution === mostInternational.institution && entry.year === mostInternational.year;
                return (
                  <Cell
                    key={`cell-canadian-${index}`}
                    fill={isHighestInternational ? "#0d6efd" : "#72AAFE"}
                  />
                );
              })}
            </Bar>
            <Bar
              dataKey="International"
              name={t("International")}
              fill="#fd7e14"
            >
              {chartData.map((entry, index) => {
                const isHighestInternational =
                  entry.institution === mostInternational.institution && entry.year === mostInternational.year;
                return (
                  <Cell
                    key={`cell-international-${index}`}
                    fill={isHighestInternational ? "#fd7e14" : "#FDB570"}
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

export default StudentTypeComparisonGraph;