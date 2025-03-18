import React, { useState } from "react";
import Title from "../components/Title";
import Button from "../components/Button";
import { toast } from "sonner";
import { getInitials } from "../utils";
import clsx from "clsx";
import { Switch } from "../components/Switch";
import {
  useGetTeamListQuery,
  usePromoteToAdminMutation,
} from "../redux/slices/api/userApiSlice";

const AdminManagement = () => {
  const { data: users, isLoading, refetch } = useGetTeamListQuery();
  const [promoteToAdmin] = usePromoteToAdminMutation();

  // State to manage admin toggle for each user
  const [adminStatus, setAdminStatus] = useState({});

  // Handle toggle change
  const handleAdminToggle = async (user, newStatus) => {
    try {
      console.log(
        `Toggling admin status for ${user.name} to: ${newStatus ? "ON" : "OFF"}`
      );

      // Update the state immediately for better UI responsiveness
      setAdminStatus((prevState) => ({
        ...prevState,
        [user._id]: newStatus,
      }));

      await promoteToAdmin({
        userId: user._id,
        isAdmin: newStatus,
      });

      refetch(); // Refresh the user list
      toast.success(
        newStatus
          ? `User ${user.name} promoted to Admin`
          : `User ${user.name} demoted to User`
      );
    } catch (error) {
      console.error(error);

      // Revert the state if the API call fails
      setAdminStatus((prevState) => ({
        ...prevState,
        [user._id]: user.isAdmin,
      }));

      toast.error(error?.data?.message || "Failed to update admin status");
    }
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Email</th>
        <th className="py-2">Role</th>
        <th className="py-2">Status</th>
        <th className="py-2 text-center">Admin Access</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
      <td className="p-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700">
            <span className="text-xs md:text-sm text-center">
              {getInitials(user.name)}
            </span>
          </div>
          {user.name}
        </div>
      </td>
      <td className="p-2">{user.email}</td>
      <td className="p-2">{user.role}</td>
      <td className="p-2">
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-sm",
            user?.isActive
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          )}
        >
          {user?.isActive ? "Active" : "Disabled"}
        </span>
      </td>
      <td className="p-2">
        <div className="flex justify-center">
          <Switch
            checked={adminStatus[user._id] ?? user.isAdmin} // Use state if available, fallback to user data
            onChange={(newStatus) => handleAdminToggle(user, newStatus)}
          />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="w-full md:px-1 px-0 mb-6">
      <div className="flex items-center justify-between mb-8">
        <Title title="Admin Access Management" />
      </div>

      <div className="bg-white px-2 md:px-4 py-4 shadow-md rounded">
        {isLoading ? (
          <div className="py-8 text-center">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full mb-5">
              <TableHeader />
              <tbody>
                {users?.map((user, index) => (
                  <TableRow key={index} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
