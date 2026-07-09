import { createContext, useState, useContext } from "react";
import { useToast } from "./ToastContext";

/* eslint-disable react-refresh/only-export-components */
const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const { showToast } = useToast();
  
  // Load from localStorage on initialization (lazy state initialization)
  const [selectedMovies, setSelectedMovies] = useState(() => {
    const saved = localStorage.getItem("compare_movies");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse compare_movies from localStorage", e);
      }
    }
    return [];
  });

  // Save to localStorage when changed
  const saveCompare = (movies) => {
    setSelectedMovies(movies);
    localStorage.setItem("compare_movies", JSON.stringify(movies));
  };

  const addMovieToCompare = (movie) => {
    // Prevent adding duplicates
    if (selectedMovies.some((m) => m.id === movie.id)) {
      return;
    }

    // Limit to 3 movies
    if (selectedMovies.length >= 3) {
      showToast("You can compare up to 3 movies at a time.", "warning");
      return;
    }

    const updated = [...selectedMovies, movie];
    saveCompare(updated);
  };

  const removeMovieFromCompare = (movieId) => {
    const updated = selectedMovies.filter((m) => m.id !== movieId);
    saveCompare(updated);
  };

  const clearCompare = () => {
    saveCompare([]);
  };

  const isMovieSelected = (movieId) => {
    return selectedMovies.some((m) => m.id === movieId);
  };

  return (
    <CompareContext.Provider
      value={{
        selectedMovies,
        addMovieToCompare,
        removeMovieFromCompare,
        clearCompare,
        isMovieSelected,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
};
