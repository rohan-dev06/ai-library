import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

const CoinHistory = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/payment/my-history', {
                headers: { Authorization: token }
            });
            setHistory(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    if (loading) return <div className="text-gray-400 text-center py-4">Loading history...</div>;

    if (history.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No History Yet</h3>
                <p className="text-gray-500 max-w-sm">
                    Your coin transaction history will appear here once you purchase coins, issue books, or pay fines.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-500" />
                    Wallet History
                </h3>
                <button
                    onClick={fetchHistory}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/30 text-gray-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {history.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {item.description || 'Transaction'}
                                    </div>
                                    <div className="text-xs text-gray-400 hidden sm:block">ID: {item._id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.type === 'PURCHASE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        item.type === 'FINE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(item.date).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right font-bold font-mono">
                                    <div className={`flex items-center justify-end gap-1 ${item.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                                        }`}>
                                        {item.amount > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {item.amount > 0 ? '+' : ''}{item.amount}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CoinHistory;
