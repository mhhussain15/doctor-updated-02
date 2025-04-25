import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// AutocompleteSearch Component
function AutocompleteSearch({ doctors, setFilteredDoctors }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Apply search filter from URL on component mount
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
      filterDoctors(search);
    }
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }

    const matchedDoctors = doctors.filter(doctor => 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 3);

    setSuggestions(matchedDoctors);
  }, [searchTerm, doctors]);

  const filterDoctors = (term) => {
    const filtered = doctors.filter(doctor => 
      doctor.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredDoctors(filtered);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    
    if (value.trim() === '') {
      // Reset search param and show all doctors
      setSearchParams(params => {
        params.delete('search');
        return params;
      });
      setFilteredDoctors(doctors);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
    filterDoctors(name);
    
    // Update URL query param
    setSearchParams(params => {
      params.set('search', name);
      return params;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      filterDoctors(searchTerm);
      
      // Update URL query param
      if (searchTerm.trim() !== '') {
        setSearchParams(params => {
          params.set('search', searchTerm);
          return params;
        });
      }
    }
  };

  return (
    <div className="autocomplete-container">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search doctors by name"
        data-testid="autocomplete-input"
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((doctor) => (
            <li 
              key={doctor.id}
              onClick={() => handleSuggestionClick(doctor.name)}
              data-testid="suggestion-item"
            >
              {doctor.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// FilterPanel Component
function FilterPanel({ doctors, setFilteredDoctors }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [consultType, setConsultType] = useState(searchParams.get('consultType') || '');
  const [specialties, setSpecialties] = useState(searchParams.getAll('specialty') || []);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  
  // Define hardcoded specialties based on the requirements
  const allSpecialties = [
    "General Physician", "Dentist", "Dermatologist", "Paediatrician", 
    "Gynaecologist", "ENT", "Diabetologist", "Cardiologist", 
    "Physiotherapist", "Endocrinologist", "Orthopaedic", "Ophthalmologist", 
    "Gastroenterologist", "Pulmonologist", "Psychiatrist", "Urologist", 
    "Dietitian/Nutritionist", "Psychologist", "Sexologist", "Nephrologist", 
    "Neurologist", "Oncologist", "Ayurveda", "Homeopath"
  ];
  
  // Apply filters from URL on component mount
  useEffect(() => {
    applyFilters();
  }, [doctors]); 

  // Apply filters whenever filter state changes
  useEffect(() => {
    if (doctors.length > 0) {
      applyFilters();
      updateUrlParams();
    }
  }, [consultType, specialties, sortBy, doctors]);

  const applyFilters = () => {
    if (!doctors || doctors.length === 0) return;
    
    let filtered = [...doctors];
    
    // Apply consultation type filter
    if (consultType) {
      filtered = filtered.filter(doctor => 
        consultType === 'Video Consult' ? doctor.videoConsult : !doctor.videoConsult
      );
    }
    
    // Apply specialty filters
    if (specialties.length > 0) {
      filtered = filtered.filter(doctor => {
        const docSpecialties = doctor.speciality || [];
        
        if (Array.isArray(docSpecialties)) {
          return specialties.some(specialty => docSpecialties.includes(specialty));
        } else if (typeof docSpecialties === 'string') {
          return specialties.includes(docSpecialties);
        }
        return false;
      });
    }
    
    // Apply sorting - create completely new arrays for sorting
    let sortedDoctors = [...filtered];
    
    if (sortBy === 'fees') {
      // Sort by fees (low to high)
      sortedDoctors.sort((a, b) => {
        // Extract numeric values from fees (removing any non-digit characters)
        const feeA = parseInt(String(a.fees).replace(/[^\d]/g, '')) || 0;
        const feeB = parseInt(String(b.fees).replace(/[^\d]/g, '')) || 0;
        return feeA - feeB;
      });
    } else if (sortBy === 'experience') {
      // Sort by experience (high to low)
      sortedDoctors.sort((a, b) => {
        const expA = parseInt(String(b.experience).replace(/[^\d]/g, '')) || 0;
        const expB = parseInt(String(a.experience).replace(/[^\d]/g, '')) || 0;
        return expA - expB;
      });
    }
    
    setFilteredDoctors(sortedDoctors);
  };

  const updateUrlParams = () => {
    setSearchParams(params => {
      // Handle consultation type
      if (consultType) {
        params.set('consultType', consultType);
      } else {
        params.delete('consultType');
      }
      
      // Handle specialties
      params.delete('specialty');
      specialties.forEach(spec => {
        params.append('specialty', spec);
      });
      
      // Handle sorting
      if (sortBy) {
        params.set('sortBy', sortBy);
      } else {
        params.delete('sortBy');
      }
      
      return params;
    });
  };

  const handleConsultTypeChange = (type) => {
    setConsultType(prevType => prevType === type ? '' : type);
  };

  const handleSpecialtyChange = (specialty) => {
    setSpecialties(prev => {
      if (prev.includes(specialty)) {
        return prev.filter(s => s !== specialty);
      } else {
        return [...prev, specialty];
      }
    });
  };

  const handleSortChange = (sort) => {
    setSortBy(prevSort => prevSort === sort ? '' : sort);
  };

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <h3 data-testid="filter-header-moc">Consultation Mode</h3>
        <div className="filter-options">
          <label>
            <input
              type="radio"
              checked={consultType === 'Video Consult'}
              onChange={() => handleConsultTypeChange('Video Consult')}
              data-testid="filter-video-consult"
            />
            Video Consult
          </label>
          <label>
            <input
              type="radio"
              checked={consultType === 'In Clinic'}
              onChange={() => handleConsultTypeChange('In Clinic')}
              data-testid="filter-in-clinic"
            />
            In Clinic
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h3 data-testid="filter-header-speciality">Speciality</h3>
        <div className="filter-options specialty-options">
          {allSpecialties.map(specialty => (
            <label key={specialty}>
              <input
                type="checkbox"
                checked={specialties.includes(specialty)}
                onChange={() => handleSpecialtyChange(specialty)}
                data-testid={`filter-specialty-${specialty ? specialty.replace('/', '-') : ''}`}
              />
              {specialty}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 data-testid="filter-header-sort">Sort By</h3>
        <div className="filter-options">
          <label>
            <input
              type="radio"
              checked={sortBy === 'fees'}
              onChange={() => handleSortChange('fees')}
              data-testid="sort-fees"
            />
            Fees (Low to High)
          </label>
          <label>
            <input
              type="radio"
              checked={sortBy === 'experience'}
              onChange={() => handleSortChange('experience')}
              data-testid="sort-experience"
            />
            Experience (High to Low)
          </label>
        </div>
      </div>
    </div>
  );
}

// DoctorCard Component
function DoctorCard({ doctor }) {
  // Helper function to display specialties correctly
  const displaySpecialties = () => {
    const specs = doctor.speciality || doctor.specialty || doctor.specialties || [];
    if (Array.isArray(specs)) {
      return specs.join(', ');
    }
    return specs;
  };

  // Fix for double rupee symbol
  const displayFees = () => {
    const fees = doctor.fees.toString();
    return fees.includes('₹') ? fees : `₹${fees}`;
  };

  return (
    <div className="doctor-card" data-testid="doctor-card">
      <div className="doctor-image">
        <img src={doctor.image || 'https://via.placeholder.com/100'} alt={doctor.name} />
      </div>
      <div className="doctor-info">
        <h2 data-testid="doctor-name">{doctor.name}</h2>
        <p data-testid="doctor-specialty">{displaySpecialties()}</p>
        <p data-testid="doctor-experience">{doctor.experience} years experience</p>
        <p data-testid="doctor-fee">{displayFees()} Consultation Fee</p>
        <div className="doctor-consult-type">
          {doctor.videoConsult ? <span className="video-consult">Video Consult Available</span> : null}
          {!doctor.videoConsult ? <span className="in-clinic">In-Clinic Only</span> : null}
        </div>
        <button className="book-button">Book Appointment</button>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("App component is rendering");
    const fetchDoctors = async () => {
      try {
        console.log("Fetching doctors data...");
        const response = await axios.get('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json');
        console.log("Data received:", response.data);
        
        setDoctors(response.data);
        setFilteredDoctors(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to fetch doctors');
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app">
      <header className="header">
        <h1>Find Doctors</h1>
        <Router>
          <AutocompleteSearch doctors={doctors} setFilteredDoctors={setFilteredDoctors} />
          <div className="content">
            <FilterPanel doctors={doctors} setFilteredDoctors={setFilteredDoctors} />
            <div className="doctor-list">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              ) : (
                <div className="no-results">
                  <h3>No doctors match your search criteria</h3>
                  <p>Try adjusting your filters or search term</p>
                </div>
              )}
            </div>
          </div>
        </Router>
      </header>
    </div>
  );
}

export default App;
