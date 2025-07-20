import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css';

const UniversitySelector = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [years, setYears] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getShortInstitutionName = (fullName) => {
    if (!fullName) return '';
    if (fullName.length > 50) {
      return fullName.substring(0, 47) + '...';
    }
    return fullName;
  };

  useEffect(() => {
    const loadCsvData = async () => {
      try {
        setLoading(true);
        
        console.log('Attempting to fetch CSV...');
        let response;
        let csvContent;
        
        const possiblePaths = [
          '/assets/combined_university_enrollment.csv', 
          
        ];
        
        for (const path of possiblePaths) {
          try {
            console.log('Trying path:', path);
            response = await fetch(path);
            console.log('Response status for', path, ':', response.status);
            
            if (response.ok) {
              csvContent = await response.text();
              if (!csvContent.startsWith('<!doctype') && !csvContent.startsWith('<html')) {
                console.log('Found CSV at:', path);
                console.log('CSV content length:', csvContent.length);
                console.log('First 200 characters:', csvContent.substring(0, 200));
                break;
              } else {
                console.log('Path', path, 'returned HTML, trying next...');
                csvContent = null;
              }
            }
          } catch (err) {
            console.log('Path', path, 'failed:', err.message);
          }
        }
        
        if (!csvContent) {
          throw new Error('Could not find CSV file at any of the expected locations. Please ensure the file is in the public/assets/ folder and try /assets/combined_university_enrollment.csv');
        }
        
        Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }
            
            const data = results.data;
            setCsvData(data);
            
            console.log('CSV Headers:', results.meta.fields);
            console.log('First 2 rows:', data.slice(0, 2));
            
            const uniqueInstitutions = [...new Set(data.map(row => row.Institution))].filter(Boolean).sort();
            setInstitutions(uniqueInstitutions);
            console.log('Found institutions:', uniqueInstitutions.length);
            
            const headers = results.meta.fields || [];
            console.log('All headers:', headers);
            
            const yearColumns = headers.filter(header => {
              if (!header) return false;
              return header.startsWith('Total_');
            });
            console.log('Total columns found:', yearColumns);
            
            const uniqueYears = yearColumns
              .map(col => {
                return col.replace('Total_', '');
              })
              .filter(Boolean)
              .sort();
            
            console.log('Processed years:', uniqueYears);
            setYears(uniqueYears);
            
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setError('Failed to parse CSV file: ' + error.message);
            setLoading(false);
          }
        });
        
      } catch (err) {
        console.error('Error loading CSV:', err);
        setError('Failed to load CSV file. Please make sure the file exists at ../assets/combined_university_enrollment.csv');
        setLoading(false);
      }
    };

    loadCsvData();
  }, []);

  const handleAddTag = () => {
    if (!selectedYear || !selectedInstitution) {
      alert('Please select both a year and an institution');
      return;
    }

    if (activeTags.length >= 5) {
      alert('Maximum of 5 selections allowed');
      return;
    }

    const tagExists = activeTags.some(tag => 
      tag.year === selectedYear && tag.institution === selectedInstitution
    );

    if (tagExists) {
      alert('This combination is already selected');
      return;
    }

    const newTag = {
      id: Date.now(), 
      year: selectedYear,
      institution: selectedInstitution
    };

    setActiveTags([...activeTags, newTag]);
    
    setSelectedYear('');
    setSelectedInstitution('');
  };

  const handleRemoveTag = (tagId) => {
    setActiveTags(activeTags.filter(tag => tag.id !== tagId));
  };

  const getDataForSelection = (year, institution) => {
    const institutionRow = csvData.find(row => row.Institution === institution);
    if (!institutionRow) return null;

    const data = {
      total: institutionRow[`Total_${year}`] || 'N/A',
      men: institutionRow[`Men_${year}`] || 'N/A',
      women: institutionRow[`Women_${year}`] || 'N/A',
      canadian: institutionRow[`Canadian_${year}`] || 'N/A',
      international: institutionRow[`International_${year}`] || 'N/A'
    };

    return data;
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">University Enrollment Data Selector</h4>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-5">
              <label htmlFor="yearSelect" className="form-label">Select Year:</label>
              <select 
                id="yearSelect"
                className="form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Choose a year...</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-5">
              <label htmlFor="institutionSelect" className="form-label">Select Institution:</label>
              <select 
                id="institutionSelect"
                className="form-select"
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
              >
                <option value="">Choose an institution...</option>
                {institutions.map((institution, index) => (
                  <option key={index} value={institution}>
                    {getShortInstitutionName(institution)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-success w-100"
                onClick={handleAddTag}
                disabled={!selectedYear || !selectedInstitution || activeTags.length >= 5}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Add
              </button>
            </div>
          </div>

          <div className="mb-3">
            <small className="text-muted">
              Selections: {activeTags.length}/5
            </small>
          </div>

          <div className="card bg-light">
            <div className="card-header">
              <h5 className="mb-0">Active Selections</h5>
            </div>
            <div className="card-body">
              {activeTags.length === 0 ? (
                <p className="text-muted mb-0">No selections yet. Use the form above to add up to 5 combinations.</p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {activeTags.map((tag) => (
                    <span key={tag.id} className="badge bg-primary fs-6 p-2 d-flex align-items-center">
                      <div className="me-2">
                        <div className="fw-bold">{getShortInstitutionName(tag.institution)}</div>
                        <div className="small opacity-75">{tag.year}</div>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-light p-1 ms-1"
                        onClick={() => handleRemoveTag(tag.id)}
                        style={{ 
                          fontSize: '12px', 
                          lineHeight: '1',
                          minWidth: '20px',
                          height: '20px',
                          borderRadius: '50%'
                        }}
                      >
                        ×
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
  );
};

export default UniversitySelector;