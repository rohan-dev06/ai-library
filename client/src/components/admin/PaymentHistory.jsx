import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Search, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentHistory = () => {
    const { token } = useAuth();
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPayments = async () => {
        try {
            const res = await axios.get('/api/payment/all', {
                headers: { Authorization: token }
            });
            setPayments(res.data);
            setFilteredPayments(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching payments", error);
            toast.error("Failed to load payment history");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = payments.filter(p =>
            p.username.toLowerCase().includes(lowerQuery) ||
            String(p._id).toLowerCase().includes(lowerQuery)
        );
        setFilteredPayments(filtered);
    }, [searchQuery, payments]);

    if (loading) return <div className="text-white text-center py-8">Loading transactions...</div>;

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-2">💳</span> Transaction History
                </h2>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by user or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-700/50 text-gray-100 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">User</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 text-right rounded-tr-lg">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredPayments.map((payment) => (
                            <tr key={payment._id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 font-medium text-white">
                                    {payment.username}
                                </td>
                                <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                                    +{payment.amount} Coins
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(payment.date).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'success'
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-red-500/10 text-red-400'
                                        }`}>
                                        {payment.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {payment.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredPayments.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-500">
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentHistory;
