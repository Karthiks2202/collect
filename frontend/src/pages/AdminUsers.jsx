import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      // ✅ Use shared API instance (no hardcoded URL, token auto-attached)
      const res = await API.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      showToast("User deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete user", "error");
    }
  }, [showToast]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin - Users</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.is_admin ? "Yes" : "No"}</td>
              <td>
                <button
                  onClick={() => deleteUser(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;