import React from 'react';
import Navbar from '../components/Navbar';
import CoinHistory from '../components/CoinHistory';

const History = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
            <Navbar />
            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Transaction History</h1>
                <CoinHistory />
            </div>
        </div>
    );
};

export default History;
