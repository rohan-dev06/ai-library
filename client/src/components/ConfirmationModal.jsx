import React from 'react';
import { X, Coins } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, book, balance }) => {
    if (!isOpen || !book) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Purchase</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <img
                            src={book.image}
                            alt={book.title}
                            className="w-20 h-28 object-cover rounded-lg shadow-md"
                        />
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2">{book.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{book.author}</p>
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium text-sm">
                                <Coins className="w-4 h-4 fill-current" />
                                <span>Cost: 100 Coins</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                        Your current balance is <span className="font-bold text-gray-900 dark:text-white">{balance} coins</span>.
                        After this transaction, you will have <span className="font-bold text-gray-900 dark:text-white">{balance - 100} coins</span> remaining.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
                        >
                            Confirm Issue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
