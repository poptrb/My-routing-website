import {useEffect, useRef, useState, useCallback} from 'react';
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import debounceFn from "lodash.debounce";

export function useAutoCompleteSuggestions(
  inputString,
  requestOptions = {},
  debounce = 1000,
) {
  const placesLib = useMapsLibrary('places');

  // stores the current sessionToken
  const sessionTokenRef =
    useRef(null);

  // the suggestions based on the specified input
  const [suggestions, setSuggestions] = useState([]);

  // indicates if there is currently an incomplete request to the places API
  const [isLoading, setIsLoading] = useState(false);

  // once the PlacesLibrary is loaded and whenever the input changes, a query
  // is sent to the Autocomplete Data API.

  const debouncedPlacePredictions =  useCallback(
    debounceFn((args) => {
      console.log('Called autocompleter')
      args.suggestionService.fetchAutocompleteSuggestions(args.request).then(res => {
        args.setSuggestions(res.suggestions);
        args.setIsLoading(false);
      })
    }, debounce),
  [debounce]);

  useEffect(() => {
    if (!placesLib) return;

    const {AutocompleteSessionToken, AutocompleteSuggestion} = placesLib;

    // Create a new session if one doesn't already exist. This has to be reset
    // after `fetchFields` for one of the returned places is called by calling
    // the `resetSession` function returned from this hook.
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    const request = {
      ...requestOptions,
      input: inputString,
      sessionToken: sessionTokenRef.current
    };

    if (inputString === '') {
      if (suggestions.length) setSuggestions([]);
      return;
    }

    setIsLoading(true);
    debouncedPlacePredictions({
      request: request,
      suggestionService: AutocompleteSuggestion,
      setSuggestions: setSuggestions,
      setIsLoading: setIsLoading
    });
  }, [placesLib, inputString, requestOptions, suggestions, debouncedPlacePredictions]);

  return {
    suggestions,
    isLoading,
    resetSession: () => {
      sessionTokenRef.current = null;
      setSuggestions([]);
    }
  };
}
