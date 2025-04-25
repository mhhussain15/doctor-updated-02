import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './FilterPanel.css';

function FilterPanel({ doctors, setFilteredDoctors }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [consultType, setConsultType] = useState(searchParams.get('consultType') || '');
  const [specialties, setSpecialties] = useState(searchParams.getAll('specialty') || []);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  
  // Debug log to see doctor data structure
  useEffect(() => {
    if (doctors.length > 0) {
      console.log("Doctor example:", doctors[0]);
      console.log("Doctor properties:", Object.keys(doctors[0]));
    }
  }, [doctors]);
  
  // Define hardcoded specialties based on the requirements and test IDs
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
      
      console.log("Sorted by fees:", sortedDoctors.map(d => d.fees));
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

export default FilterPanel;
