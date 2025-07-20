import { useState, useEffect } from "react";
import Papa from "papaparse";
import "bootstrap/dist/css/bootstrap.min.css";
import EnrollmentByYearGraph from "./EnrollmentByYearGraph";
import EnrollmentOverTimeGraph from "./EnrollmentOverTimeGraph";
import GenderComparisonGraph from "./GenderComparisonGraph";
import StudentTypeComparisonGraph from "./StudentTypeComparisonGraph";
import {
  t,
  setLanguage,
  getCurrentLanguage,
  getAvailableLanguages,
} from "../data/translations";

const UniversitySelector = () => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [years, setYears] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getShortInstitutionName = (fullName) => {
    if (!fullName) return "";
    if (fullName.length > 50) {
      return fullName.substring(0, 47) + "...";
    }
    return fullName;
  };

  useEffect(() => {
    const loadCsvData = async () => {
      try {
        setLoading(true);

        console.log("Attempting to fetch CSV...");
        let response;
        let csvContent;

        const possiblePaths = ["/assets/combined_university_enrollment.csv"];

        for (const path of possiblePaths) {
          try {
            console.log("Trying path:", path);
            response = await fetch(path);
            console.log("Response status for", path, ":", response.status);

            if (response.ok) {
              csvContent = await response.text();
              if (
                !csvContent.startsWith("<!doctype") &&
                !csvContent.startsWith("<html")
              ) {
                console.log("Found CSV at:", path);
                console.log("CSV content length:", csvContent.length);
                console.log(
                  "First 200 characters:",
                  csvContent.substring(0, 200)
                );
                break;
              } else {
                console.log("Path", path, "returned HTML, trying next...");
                csvContent = null;
              }
            }
          } catch (err) {
            console.log("Path", path, "failed:", err.message);
          }
        }

        if (!csvContent) {
          throw new Error(
            "Could not find CSV file at any of the expected locations. Please ensure the file is in the public/assets/ folder and try /assets/combined_university_enrollment.csv"
          );
        }

        Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn("CSV parsing warnings:", results.errors);
            }

            const data = results.data;
            setCsvData(data);

            console.log("CSV Headers:", results.meta.fields);
            console.log("First 2 rows:", data.slice(0, 2));

            const uniqueInstitutions = [
              ...new Set(data.map((row) => row.Institution)),
            ]
              .filter(Boolean)
              .sort();
            setInstitutions(uniqueInstitutions);
            console.log("Found institutions:", uniqueInstitutions.length);

            const headers = results.meta.fields || [];
            console.log("All headers:", headers);

            const yearColumns = headers.filter((header) => {
              if (!header) return false;
              return header.startsWith("Total_");
            });
            console.log("Total columns found:", yearColumns);

            const uniqueYears = yearColumns
              .map((col) => {
                return col.replace("Total_", "");
              })
              .filter(Boolean)
              .sort();

            console.log("Processed years:", uniqueYears);
            setYears(uniqueYears);

            setLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setError("Failed to parse CSV file: " + error.message);
            setLoading(false);
          },
        });
      } catch (err) {
        console.error("Error loading CSV:", err);
        setError(
          "Failed to load CSV file. Please make sure the file exists at ../assets/combined_university_enrollment.csv"
        );
        setLoading(false);
      }
    };

    loadCsvData();
  }, []);

  const handleAddTag = () => {
    if (!selectedYear || !selectedInstitution) {
      alert("Please select both a year and an institution");
      return;
    }

    if (activeTags.length >= 5) {
      alert("Maximum of 5 selections allowed");
      return;
    }

    const tagExists = activeTags.some(
      (tag) =>
        tag.year === selectedYear && tag.institution === selectedInstitution
    );

    if (tagExists) {
      alert("This combination is already selected");
      return;
    }

    const newTag = {
      id: Date.now(),
      year: selectedYear,
      institution: selectedInstitution,
    };

    setActiveTags([...activeTags, newTag]);

    setSelectedYear("");
    setSelectedInstitution("");
  };

  const handleRemoveTag = (tagId) => {
    setActiveTags(activeTags.filter((tag) => tag.id !== tagId));
  };

  const getDataForSelection = (year, institution) => {
    const institutionRow = csvData.find(
      (row) => row.Institution === institution
    );
    if (!institutionRow) return null;

    const data = {
      total: institutionRow[`Total_${year}`] || "N/A",
      men: institutionRow[`Men_${year}`] || "N/A",
      women: institutionRow[`Women_${year}`] || "N/A",
      canadian: institutionRow[`Canadian_${year}`] || "N/A",
      international: institutionRow[`International_${year}`] || "N/A",
    };

    return data;
  };

  const getGraphData = () => {
    if (activeTags.length === 0) return null;

    const selectedData = activeTags
      .map((tag) => {
        const institutionRow = csvData.find(
          (row) => row.Institution === tag.institution
        );
        if (!institutionRow) return null;

        return {
          institution: tag.institution,
          year: tag.year,
          total: parseFloat(institutionRow[`Total_${tag.year}`]) || 0,
          men: parseFloat(institutionRow[`Men_${tag.year}`]) || 0,
          women: parseFloat(institutionRow[`Women_${tag.year}`]) || 0,
          canadian: parseFloat(institutionRow[`Canadian_${tag.year}`]) || 0,
          international:
            parseFloat(institutionRow[`International_${tag.year}`]) || 0,
        };
      })
      .filter(Boolean);

    const timeSeriesData = {};
    const selectedInstitutions = [
      ...new Set(activeTags.map((tag) => tag.institution)),
    ];

    selectedInstitutions.forEach((institution) => {
      const institutionRow = csvData.find(
        (row) => row.Institution === institution
      );
      if (!institutionRow) return;

      const institutionData = years
        .map((year) => {
          const total = parseFloat(institutionRow[`Total_${year}`]) || 0;
          return {
            year: year,
            total: total,
            institution: institution,
          };
        })
        .filter((item) => item.total > 0);

      timeSeriesData[institution] = institutionData;
    });

    return {
      selectedData,
      timeSeriesData,
      institutions: selectedInstitutions,
      years: years,
    };
  };

  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => forceUpdate({});
    window.addEventListener("languageChange", handleLanguageChange);
    return () =>
      window.removeEventListener("languageChange", handleLanguageChange);
  }, []);
  const graphData = getGraphData();
  return (
    <div className="container-fluid mt-4">
      <div className="card mb-4 selectionContainer">
        <div className="card-header selectionTitle">
          <h4 className="mb-0 fs-2">{t("selector")}</h4>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-5">
              <label htmlFor="yearSelect" className="form-label">
                {t("yearLabel")}
              </label>
              <select
                id="yearSelect"
                className="form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">{t("yearPlaceholder")}</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-5">
              <label htmlFor="institutionSelect" className="form-label">
                {t("institutionLabel")}
              </label>
              <select
                id="institutionSelect"
                className="form-select"
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
              >
                <option value="">{t("institutionPlaceholder")}</option>
                {institutions.map((institution, index) => (
                  <option key={index} value={institution}>
                    {getShortInstitutionName(institution)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-success w-100 addButton"
                onClick={handleAddTag}
                disabled={
                  !selectedYear ||
                  !selectedInstitution ||
                  activeTags.length >= 5
                }
              >
                <i className="bi bi-plus-circle me-1"></i>
                {t("buttons.add")}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <small className="fs-6">
              {t("selections")} {activeTags.length}/5
            </small>
          </div>

          <div className="card selectionContainer">
            <div className="card selectionContainer">
              <div className="card-header selectionTitle">
                <h5 className="mb-0 fs-4">{t("activeSelectionsLabel")}</h5>
              </div>
              <div className="card-body">
                {activeTags.length === 0 ? (
                  <p className="text-muted mb-0">{t("noActiveSelections")}</p>
                ) : (
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {activeTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="badge addButton fs-6 p-2 d-flex align-items-center"
                        style={{ maxWidth: "100%" }}
                      >
                        <div className="me-2" style={{ minWidth: 0, flex: 1 }}>
                          <div
                            className="fw-bold text-truncate"
                            style={{ maxWidth: "200px" }}
                            title={getShortInstitutionName(tag.institution)}
                          >
                            {getShortInstitutionName(tag.institution)}
                          </div>
                          <div
                            className="small opacity-75 text-truncate"
                            style={{ maxWidth: "200px" }}
                            title={tag.year}
                          >
                            {tag.year}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-light p-1 ms-1 align-items-center flex-shrink-0"
                          onClick={() => handleRemoveTag(tag.id)}
                          style={{
                            borderRadius: "50%",
                          }}
                        >
                          <i className="bi bi-x fs-6"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {graphData && graphData.selectedData.length > 0 && (
        <div className="row">
          <div className="col-lg-6 mb-4">
            <EnrollmentByYearGraph data={graphData.selectedData} />
          </div>
          <div className="col-lg-6 mb-4">
            <EnrollmentOverTimeGraph data={graphData.timeSeriesData} />
          </div>
          <div className="col-lg-6 mb-4">
            <GenderComparisonGraph data={graphData.selectedData} />
          </div>
          <div className="col-lg-6 mb-4">
            <StudentTypeComparisonGraph data={graphData.selectedData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversitySelector;
