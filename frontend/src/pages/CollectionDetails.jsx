import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  getCollection,
  removeMovieFromCollection,
} from "../services/collectionService";

import "./CollectionDetails.css";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const CollectionDetails = () => {
  const { id } = useParams();

  const [collection, setCollection] = useState(null);

  const loadCollection = useCallback(async () => {
    try {
      const data = await getCollection(id);
      setCollection(data);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadCollection();
    }, 0);
    return () => clearTimeout(t);
  }, [loadCollection]);

  const handleRemove = useCallback(async (movieId) => {
    if (!window.confirm("Remove this movie from the collection?")) return;

    try {
      await removeMovieFromCollection(id, movieId);
      loadCollection();
    } catch (error) {
      console.error(error);
    }
  }, [id, loadCollection]);

  if (!collection) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="collection-details">
      <h2>{collection.name}</h2>

      <p>{collection.description}</p>

      <div className="movies-grid">
        {collection.movies?.length === 0 ? (
          <h3>No movies in this collection.</h3>
        ) : (
          collection.movies.map((movie) => (
            <div className="movie-card" key={movie.movie_id}>
              <img
                src={
                  movie.poster_path && movie.poster_path !== "N/A"
                    ? movie.poster_path.startsWith("http")
                      ? movie.poster_path
                      : `${IMAGE_BASE_URL}${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={movie.movie_title}
              />

              <h4>{movie.movie_title}</h4>

              <button
                className="remove-btn"
                onClick={() => handleRemove(movie.movie_id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollectionDetails;