import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await API.get("/admin/reviews");
      setReviews(res.data.reviews);
    } catch {
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchReviews();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchReviews]);

  const deleteReview = useCallback(async (id) => {
    try {
      await API.delete(`/admin/reviews/${id}`);
      fetchReviews();
    } catch {
    }
  }, [fetchReviews]);

  return (
  <AdminLayout>
    <div style={{ padding: "20px", width: "100%" }}>
      <h1>Review Moderation</h1>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Movie ID</th>
            <th>Review</th>
            <th>Rating</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {Array.isArray(reviews) &&
  reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.id}</td>
              <td>{review.movie_id}</td>
              <td>{review.review}</td>
              <td>{review.rating}</td>
              <td>
                <button
                  onClick={() =>
                    deleteReview(review.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </AdminLayout>
  );
}

export default AdminReviews;