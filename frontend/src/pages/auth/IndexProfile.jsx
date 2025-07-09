import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "../../components/Dashboard";
import { AiOutlineEdit, AiOutlineEye, AiOutlineSearch } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { UserEndPoint } from "../../utils/ApiRequest";
import AddUser from "./AddUser"; // Adjust path if needed

const IndexProfile = () => {
  const [users, setUsers] = useState([]);
  const [editingRole, setEditingRole] = useState({});
  const [loading, setLoading] = useState(true);
  const { user: me, token, isAuthenticated } = useAuth();
  const [userToDelete, setUserToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const navigate = useNavigate();

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(UserEndPoint);
      const visible = res.data.filter(
        (u) =>
          (u.role === "Viewer" || u.role === "Admin" || u.role === "SuperAdmin") &&
            u._id !== me.id
      );
      setUsers(visible);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, [isAuthenticated, token, me]);

  // Real-time search/filter logic
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(
        `${UserEndPoint}/${userId}/role`,
        { role: newRole }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      setEditingRole({});
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${UserEndPoint}/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  return (
    <Dashboard>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">
          User Management
        </h1>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-all text-white px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <span className="font-semibold text-base">Add User</span>
        </button>
      </div>

      {/* AddUser Modal */}
      {showAddUserModal && (
        <AddUser
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={() => {
            setShowAddUserModal(false);
            fetchUsers();
          }}
        />
      )}

      {/* Search Bar */}
      <div className="mb-6 flex items-center w-full max-w-md">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-gray-400">
            <AiOutlineSearch size={20} />
          </span>
          <input
            type="text"
            placeholder="Search by name or email…"
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 outline-none transition-all bg-gray-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="text-gray-600 text-lg font-medium">Loading users...</span>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl p-0 md:p-6 transition-all border">
          {filteredUsers.length === 0 ? (
            <div className="py-10 flex flex-col items-center">
              <span className="text-gray-500 text-xl font-medium">No users found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto rounded-xl">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                    <th className="p-3 text-sm font-semibold text-gray-700">No</th>
                    <th className="p-3 text-sm font-semibold text-gray-700">Name</th>
                    <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
                    <th className="p-3 text-sm font-semibold text-gray-700">Role</th>
                    <th className="p-3 text-sm font-semibold text-gray-700 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, i) => (
                    <tr
                      key={user._id}
                      className={
                        i % 2 === 0
                          ? "bg-white border-b border-gray-100"
                          : "bg-gray-50 border-b border-gray-100"
                      }
                    >
                      <td className="p-3 text-center">{i + 1}</td>
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        {editingRole[user._id] ? (
                          <select
                            value={editingRole[user._id]}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            className="border rounded-lg px-2 py-1 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          >
                            <option value="Viewer">Viewer</option>
                            <option value="Admin">Admin</option>
                            <option value="SuperAdmin">Super Admin</option>
                          </select>
                        ) : (
                          <span className="capitalize px-2 py-1 rounded text-gray-700 bg-gray-100">
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="p-3 flex gap-1 justify-center">
                        {/* Edit Role Button */}
                        <button
                          onClick={() =>
                            setEditingRole((prev) => ({
                              ...prev,
                              [user._id]: user.role,
                            }))
                          }
                          className="bg-yellow-400 hover:bg-yellow-500 transition text-gray-800 px-2 py-1 rounded-full flex items-center justify-center focus:ring-2 focus:ring-yellow-200"
                          title="Edit Role"
                          aria-label="Edit Role"
                        >
                          <AiOutlineEdit />
                        </button>
                        {/* Edit Profile Button */}
                        <button
                          onClick={() =>
                            navigate("/profile/edit", { state: { user } })
                          }
                          className="bg-blue-500 hover:bg-blue-700 transition text-white px-2 py-1 rounded-full flex items-center justify-center focus:ring-2 focus:ring-blue-200"
                          title="Edit Profile"
                          aria-label="Edit Profile"
                        >
                          <AiOutlineEye />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="bg-red-500 hover:bg-red-700 transition text-white px-2 py-1 rounded-full flex items-center justify-center focus:ring-2 focus:ring-red-300"
                          title="Delete User"
                          aria-label="Delete User"
                        >
                          <MdOutlineDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Delete User</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-bold">{userToDelete.name}</span>?
            </p>
            <p className="mb-6 text-gray-500 text-sm">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteUser(userToDelete._id);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
};

export default IndexProfile;
