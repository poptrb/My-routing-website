// src/hooks/useAutoCompleteSuggestions.js
import { useState, useEffect, useRef } from 'react';
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import debounce from "lodash.debounce";

export function useAutoCompleteSuggestions(inputString, requestOptions = {}) {
  const placesLib = useMapsLibrary('places');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use refs to maintain stable identity across renders
  const sessionTokenRef = useRef(null);
  const debounceFuncRef = useRef(null);

  // Initialize the debounce function once
  useEffect(() => {
    if (!debounceFuncRef.current) {
      debounceFuncRef.current = debounce((input, token, service) => {
        if (!input || !service) {
          setIsLoading(false);
          return;
        }

        const request = {
          ...requestOptions,
          input: input,
          sessionToken: token
        };

        service.fetchAutocompleteSuggestions(request)
          .then(result => {
            setSuggestions(result.suggestions || []);
            setIsLoading(false);
          })
          .catch(error => {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
            setIsLoading(false);
          });
      }, 500); // 300ms is a good balance for typing
    }

    // Cleanup function
    return () => {
      if (debounceFuncRef.current) {
        debounceFuncRef.current.cancel();
      }
    };
  }, [requestOptions]);

  // Handle input changes
  useEffect(() => {
    // Can't do anything without places library
    if (!placesLib) return;

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    // Create a new session token if needed
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    // Clear suggestions if input is empty
    // if (!inputString) {
    //   setSuggestions([]);
    //   return;
    // }

    // Set loading state and fetch suggestions
    setIsLoading(true);

    // Call debounced function
    debounceFuncRef.current(
      inputString,
      sessionTokenRef.current,
      AutocompleteSuggestion
    );

  }, [inputString, placesLib]);

  // Reset function
  const resetSession = () => {
    sessionTokenRef.current = null;
    setSuggestions([]);
    if (debounceFuncRef.current) {
      debounceFuncRef.current.cancel();
    }
  };

  return {
    suggestions,
    isLoading,
    resetSession
  };
}
