import React, { createContext, useState, useContext, useEffect } from "react";

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [selectedMovies, setSelectedMovies] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("compare_movies");
    if (saved) {
      try {
        setSelectedMovies(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse compare_movies from localStorage", e);
      }
    }
  }, []);

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
      alert("You can compare up to 3 movies at a time.");
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
