import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, X, Calendar, UserCheck, UserMinus, UserPlus, Users, Wifi, Eye, Key, Settings, Power, LogOut } from "lucide-react";

import {
  getAllCounsellorsonBreak,
} from "../network/counsellor";

import Loader from "../common/Loader";

const UserListing = () => {
  // State to store users from API
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [roleFilter, setRoleFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('') 

  // State for modals and selected user
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [showPreferredModeModal, setShowPreferredModeModal] = useState(false);

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const fetchCounsellors = async () => {
      setIsLoading(true);
      try {
       
        const params = {};
        if (startDate) params.from = startDate;
        if (endDate) params.to = endDate;
        
        const response = await getAllCounsellorsonBreak(params);
        setUsers(response.data?.data || response.data || response);
        setError(null);
      } catch (error) {
        console.error("Error fetching counsellors:", error);
        setError("Failed to load counsellors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCounsellors();
  }, [startDate, endDate]); 

 
  const dashboardStats = useMemo(() => {
    if (!users) return {};

    return {
      totalAgents: 49,
        
      inactiveAgents: users.filter(u => u.currently_on_break).length, 
      activeAgents: 49-users.filter(u => u.currently_on_break).length
    };
  }, [users]);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users?.filter((user) => {
      const searchMatch =
        !searchQuery ||
        user.counsellor_details.counsellor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.counsellor_details.counsellor_email?.toLowerCase().includes(searchQuery.toLowerCase());

      const roleMatch = !roleFilter || user.counsellor_details.role === roleFilter;

      // Status filter logic: 'active' = not on break, 'inactive' = on break
      const statusMatch = !statusFilter || 
        (statusFilter === 'active' && !user.currently_on_break) ||
        (statusFilter === 'inactive' && user.currently_on_break);
      
      return searchMatch && roleMatch && statusMatch;
    });
  }, [users, roleFilter, searchQuery, statusFilter]);

  // Get unique roles for dropdown
  const uniqueRoles = useMemo(() => {
    if (!users) return [];
    return [...new Set(users.map((user) => user?.counsellor_details?.role).filter(Boolean))];
  }, [users]);

  // Reset all filters
  const resetFilters = () => {
    setRoleFilter("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setStatusFilter("");
  };

  // Format status for display
  const displayStatus = (user) => {
    return user.currently_on_break ? "Yes" : "No";
  };

  // Get status badge color
  const getStatusBadgeColor = (user) => {
    return user.currently_on_break 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800';
  };

  // Loading state
  if (isLoading) {
    return <Loader />;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeFiltersCount = [roleFilter, startDate, endDate, statusFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your team members and their permissions</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Total Agents */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Agents</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardStats.totalAgents || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Active Agents (Not on break) */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Agents</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardStats.activeAgents || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Inactive Agents (On break) */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Break</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardStats.inactiveAgents || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <UserMinus className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

        
        </div>
      </div>

      {/* Table */}
      <div className="px-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currently on Break</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No of Breaks in a timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Break Time</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Break</th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No users found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.counsellor_id} className="hover:bg-gray-50">
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {user?.counsellor_details?.counsellor_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user?.counsellor_details?.counsellor_name}</div>
                            <div className="text-xs text-gray-500">ID: {user.counsellor_id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user?.counsellor_details?.counsellor_email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user?.counsellor_details?.role === 'l3' ? 'bg-blue-100 text-blue-800' :
                          user?.counsellor_details?.role === 'l2' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user?.counsellor_details?.role?.toUpperCase() || 'N/A'}
                        </span>
                      </td>

                      {/* Currently on Break Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user)}`}>
                          {displayStatus(user)}
                        </span>
                      </td>

                      {/* Number of breaks today */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user?.no_of_breaks_today || 0}
                        </span>
                      </td>

                      {/* Total break time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                         {secondsToHHMMSS(user?.total_break_time) || 0}
                        </span>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                       <p> <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          start at: {user?.last_break.break_start? formatDate(user?.last_break?.break_start) :'' || 0}
                        </span><br/>
                        
                        <span className="inline-flex px-2 mt-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          end at: {user?.last_break.break_end? formatDate(user?.last_break?.break_end) :'On Break' || 0}
                        </span><br/></p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-xs bg-opacity-50 transition-opacity"
            onClick={() => setShowFilters(false)}
          ></div>

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div>
                <h2 className="text-lg font-semibold text-white">Filter Users</h2>
                <p className="text-sm text-white mt-1">Refine your search results</p>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-blue-500 rounded-full"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Role Filter */}
              <div>
                <div className="flex items-center mb-4">
                  <UserCheck className="h-4 w-4 text-gray-500 mr-2" />
                  <label className="text-sm font-medium text-gray-900">Filter by Role</label>
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role?.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <div className="flex items-center mb-4">
                  <Users className="h-4 w-4 text-gray-500 mr-2" />
                  <label className="text-sm font-medium text-gray-900">Break Status</label>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={statusFilter === "active"}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">Not on Break (Active)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={statusFilter === "inactive"}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">On Break</span>
                  </label>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <div className="flex items-center mb-4">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <label className="text-sm font-medium text-gray-900">Date Range</label>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={resetFilters}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  Clear All Filters
                </button>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Filters ({filteredUsers.length} results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListing;
function secondsToHHMMSS(sc) {
  const hours = Math.floor(sc / 3600);
  const minutes = Math.floor((sc % 3600) / 60);
  const seconds = sc % 60;

  const pad = (num) => String(num).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}


 const formatDate = (dateString) => {
        if (!dateString) return "--";

        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          
        };

        return date.toLocaleString('en-US', options);
    }