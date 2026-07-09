import { useEffect, useState, useCallback } from "react";

import API from "../services/api";

function History() {

  const [history, setHistory] =
    useState([]);

  const fetchHistory = useCallback(async () => {
    try {
      // ✅ Use shared API instance (no hardcoded URL, token auto-attached)
      const response = await API.get("/history");
      setHistory(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchHistory();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchHistory]);

  return (
    <div className="page">

      <h1>Search History</h1>

      <div className="history-list">

        {history.map((item, index) => (

          <div
            className="history-item"
            key={index}
          >

            <h3>{item.keyword}</h3>

            <p>
              {item.searched_at}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

export default History;