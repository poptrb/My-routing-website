// src/components/GooglePlacesAutocomplete.js
import React, { useState, useRef } from 'react';
import { useAutoCompleteSuggestions } from '../hooks/useAutoCompleteSuggestions';
import { useMapsLibrary } from "@vis.gl/react-google-maps";

// Simple component without optimization
function GooglePlacesAutocomplete({ onPlaceSelect, onSuggestionInputClick }) {
  const [inputValue, setInputValue] = useState('');
  const places = useMapsLibrary('places');
  const clickedRef = useRef(false);

  // Get suggestions using our hook
  const { suggestions, resetSession } = useAutoCompleteSuggestions(inputValue);

  // Handle input changes
  const handleInput = (event) => {
    const value = event.target.value;
    setInputValue(value);

    // Only call onSuggestionInputClick once
    if (!clickedRef.current && onSuggestionInputClick) {
      onSuggestionInputClick();
      clickedRef.current = true;

      // Reset after a delay
      setTimeout(() => {
        clickedRef.current = false;
      }, 1000);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = async (suggestion) => {
    if (!places || !suggestion.placePrediction) return;

    try {
      const place = suggestion.placePrediction.toPlace();

      await place.fetchFields({
        fields: ['location']
      });

      // Call the callback
      if (onPlaceSelect && place.location) {
        onPlaceSelect(place);
      }

      // Reset the input and suggestions
      setInputValue('');
      resetSession();

    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  return (
    <div className="autocomplete-container">
      <input
        className="autocomplete-input"
        value={inputValue}
        onChange={handleInput}
        placeholder="Search for a place"
        autoComplete="off"
      />

      {suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="autocomplete-suggestions-item"
              onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion.placePrediction?.text.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Export a memoized version to prevent re-renders
export default React.memo(GooglePlacesAutocomplete);
