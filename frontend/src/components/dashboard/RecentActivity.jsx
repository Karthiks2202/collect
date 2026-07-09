import { useState } from "react";

const TABS = ["watched", "favorites", "reviews"];
const TAB_LABELS = { watched: "🎬 Watched", favorites: "❤️ Favorites", reviews: "✍️ Reviews" };

function StarRating({ rating }) {
  const stars = Math.round(rating || 0);
  return (
    <span className="star-rating" aria-label={`${stars} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < stars ? "#f7c44f" : "rgba(255,255,255,0.15)", fontSize: "13px" }}>
          ★
        </span>
      ))}
      <span className="star-rating__num">{rating}/5</span>
    </span>
  );
}

function PosterFallback({ title }) {
  return (
    <div className="activity-poster activity-poster--fallback">
      <span>{title?.[0] ?? "?"}</span>
    </div>
  );
}

function WatchedList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="activity-empty">
        <span>🎞️</span>
        <p>No watched movies yet. Start watching!</p>
      </div>
    );
  }
  return (
    <ul className="activity-list">
      {items.map((item, idx) => (
        <li key={idx} className="activity-item">
          {item.poster ? (
            <img
              src={`https://image.tmdb.org/t/p/w92${item.poster}`}
              alt={item.title}
              className="activity-poster"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <PosterFallback title={item.title} />
          )}
          <div className="activity-info">
            <p className="activity-title">{item.title}</p>
            {item.watched_date && (
              <p className="activity-meta">
                📅 {new Date(item.watched_date).toLocaleDateString("en-US", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </p>
            )}
          </div>
          <span className="activity-badge activity-badge--blue">Watched</span>
        </li>
      ))}
    </ul>
  );
}

function FavoritesList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="activity-empty">
        <span>❤️</span>
        <p>No favorites added yet.</p>
      </div>
    );
  }
  return (
    <ul className="activity-list">
      {items.map((item, idx) => (
        <li key={idx} className="activity-item">
          {item.poster ? (
            <img
              src={`https://image.tmdb.org/t/p/w92${item.poster}`}
              alt={item.title}
              className="activity-poster"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <PosterFallback title={item.title} />
          )}
          <div className="activity-info">
            <p className="activity-title">{item.title}</p>
          </div>
          <span className="activity-badge activity-badge--red">Favorite</span>
        </li>
      ))}
    </ul>
  );
}

function ReviewsList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="activity-empty">
        <span>✍️</span>
        <p>No reviews written yet.</p>
      </div>
    );
  }
  return (
    <ul className="activity-list">
      {items.map((item, idx) => (
        <li key={idx} className="activity-item activity-item--review">
          <div className="activity-review-icon">✍️</div>
          <div className="activity-info">
            <p className="activity-title">{item.movie_title}</p>
            <StarRating rating={item.rating} />
            {item.created_at && (
              <p className="activity-meta">
                📅 {new Date(item.created_at).toLocaleDateString("en-US", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </p>
            )}
          </div>
          <span className="activity-badge activity-badge--gold">Review</span>
        </li>
      ))}
    </ul>
  );
}

function RecentActivity({ data }) {
  const [activeTab, setActiveTab] = useState("watched");

  if (!data) {
    return (
      <div className="recent-activity-card">
        <div className="recent-activity__header">
          <h3 className="chart-card__title">Recent Activity</h3>
        </div>
        <div className="activity-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="activity-item activity-item--skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const hasAnyActivity =
    data.recent_watched?.length > 0 ||
    data.recent_favorites?.length > 0 ||
    data.recent_reviews?.length > 0;

  if (!hasAnyActivity) {
    return (
      <div className="recent-activity-card">
        <div className="recent-activity__header">
          <span className="chart-card__icon">⚡</span>
          <h3 className="chart-card__title">Recent Activity</h3>
        </div>
        <div className="activity-empty activity-empty--large">
          <span>🌟</span>
          <h4>No activity yet!</h4>
          <p>Start watching movies, adding favorites, or writing reviews to see your activity here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activity-card">
      <div className="recent-activity__header">
        <span className="chart-card__icon">⚡</span>
        <h3 className="chart-card__title">Recent Activity</h3>
      </div>
      <div className="activity-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            id={`activity-tab-${tab}`}
            className={`activity-tab${activeTab === tab ? " activity-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>
      <div className="activity-content">
        {activeTab === "watched" && <WatchedList items={data.recent_watched} />}
        {activeTab === "favorites" && <FavoritesList items={data.recent_favorites} />}
        {activeTab === "reviews" && <ReviewsList items={data.recent_reviews} />}
      </div>
    </div>
  );
}

export default RecentActivity;
