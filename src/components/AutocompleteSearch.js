import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './AutocompleteSearch.css';

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
          {suggestions.map((doctor, index) => (
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

export default AutocompleteSearch;

