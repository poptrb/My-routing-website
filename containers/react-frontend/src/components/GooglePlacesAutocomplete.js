import React, {useCallback, useState } from 'react';
import {useAutoCompleteSuggestions} from '../hooks/useAutoCompleteSuggestions';
import { useMapsLibrary } from "@vis.gl/react-google-maps";


export const GooglePlacesAutocomplete= ({onPlaceSelect, onSuggestionInputClick}) => {
  const places = useMapsLibrary('places');

  const [inputValue, setInputValue] = useState('');
  const {suggestions, resetSession} = useAutoCompleteSuggestions(inputValue);

  const handleInput = useCallback((event) => {
    onSuggestionInputClick(event.target);
    setInputValue((event.target).value);
  }, [onSuggestionInputClick]);

  const handleSuggestionClick = useCallback(
    async (suggestion) => {
      if (!places) return;
      if (!suggestion.placePrediction) return;

      const place = suggestion.placePrediction.toPlace();

      await place.fetchFields({
        fields: [
          'location',
        ]
      });

      setInputValue('');

      // calling fetchFields invalidates the session-token, so we now have to call
      // resetSession() so a new one gets created for further search
      resetSession();

      onPlaceSelect(place);
    },
    [places, onPlaceSelect, resetSession]
  );

  return (
    <div className="autocomplete-container">
      <input
        className="autocomplete-input"
        value={inputValue}
        onInput={event => handleInput(event)}
        placeholder="Search for a place"
      />

      {suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.map((suggestion, index) => {
            return (
              <li
                key={index}
                className="autocomplete-suggestions-item"
                onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion.placePrediction?.text.text}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;

