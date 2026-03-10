import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Search, User, Shield, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageUsers = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: token }
            });
            setUsers(res.data);
            setFilteredUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users", error);
            toast.error("Failed to load users");
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId, currentStatus) => {
        try {
            const res = await axios.put(`/api/admin/users/${userId}/block`, {}, {
                headers: { Authorization: token }
            });
            toast.success(res.data.message);
            // Update local state
            setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: res.data.isBlocked } : u));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user status");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = users.filter(user =>
            user.username.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery)
        );
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    // Helper to determine status
    const getUserStatus = (lastActive) => {
        if (!lastActive) return 'Offline';
        const diff = Date.now() - new Date(lastActive).getTime();
        // Considered active if seen in last 5 minutes
        return diff < 5 * 60 * 1000 ? 'Active' : 'Offline';
    };

    if (loading) return <div className="text-white text-center py-8">Loading users...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="mr-2">👥</span> User Management
                </h2>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white text-gray-900 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-700">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">User</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Coins</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Last Active</th>
                            <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => {
                            const status = getUserStatus(user.lastActive);
                            return (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-3">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.username}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                                            : 'bg-blue-100 text-blue-700 border-blue-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-yellow-600 font-medium">
                                        {user.coins} 🪙
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit ${status === 'Active'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                                {status}
                                            </span>
                                            {user.isBlocked && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 w-fit">
                                                    BLOCKED
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleBlockUser(user._id, user.isBlocked)}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${user.isBlocked
                                                ? 'bg-green-600 hover:bg-green-500 text-white'
                                                : 'bg-red-600 hover:bg-red-500 text-white'
                                                }`}
                                        >
                                            {user.isBlocked ? 'Unblock' : 'Block'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
