import { useEffect, useState, useCallback } from "react";
import API from "../services/api";

function UserList() {
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Users</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={th}>ID</th>
            <th style={th}>Username</th>
            <th style={th}>Email</th>
            <th style={th}>Admin</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td style={td}>{user.id}</td>
                <td style={td}>{user.username}</td>
                <td style={td}>{user.email}</td>
                <td style={td}>{user.is_admin ? "Yes" : "No"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  border: "1px solid #ddd",
  padding: "10px",
  background: "#f5f5f5",
};

const td = {
  border: "1px solid #ddd",
  padding: "10px",
};

export default UserList;