import React, { useState } from 'react';
import axios from 'axios';
import { X, CreditCard, Smartphone, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState('select'); // select, processing, success
    const [selectedAmount, setSelectedAmount] = useState(500);
    const [selectedMethod, setSelectedMethod] = useState('card');

    if (!isOpen) return null;

    const coinPackages = [
        { coins: 100, price: '$1.00' },
        { coins: 500, price: '$4.50', popular: true },
        { coins: 1000, price: '$8.00' },
        { coins: 5000, price: '$35.00' },
    ];

    const handlePayment = async () => {
        setStep('processing');
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.post('/api/payment/create', {
                amount: selectedAmount,
                paymentMethod: selectedMethod
            }, {
                headers: { Authorization: token }
            });

            if (res.data) {
                setStep('success');
                setTimeout(() => {
                    onSuccess(res.data.coins); // Pass updated coins back
                    toast.success(`Purchased ${selectedAmount} coins!`);
                    handleClose();
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Payment failed");
            setStep('select');
        }
    };

    const handleClose = () => {
        setStep('select');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            <div className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Secure Checkout</h3>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {step === 'select' && (
                        <>
                            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">1. Select Package</h4>
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {coinPackages.map(pkg => (
                                    <button
                                        key={pkg.coins}
                                        onClick={() => setSelectedAmount(pkg.coins)}
                                        className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selectedAmount === pkg.coins
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-white/30'
                                            }`}
                                    >
                                        {pkg.popular && (
                                            <span className="absolute -top-3 bg-blue-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Best Value</span>
                                        )}
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{pkg.coins}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Coins</span>
                                        <div className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">{pkg.price}</div>
                                    </button>
                                ))}
                            </div>

                            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">2. Payment Method</h4>
                            <div className="space-y-3 mb-8">
                                <button
                                    onClick={() => setSelectedMethod('card')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedMethod === 'card'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-white/10'
                                        }`}
                                >
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">Credit / Debit Card</div>
                                        <div className="text-xs text-gray-500"> Visa, Mastercard, AMEX</div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                        {selectedMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedMethod('upi')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedMethod === 'upi'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-white/10'
                                        }`}
                                >
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">UPI / Wallets</div>
                                        <div className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                        {selectedMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={handlePayment}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
                            >
                                Pay Now
                            </button>
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment...</h4>
                            <p className="text-gray-500 text-center">Please do not close this window.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h4>
                            <p className="text-gray-500 text-center">You have added {selectedAmount} coins to your wallet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
