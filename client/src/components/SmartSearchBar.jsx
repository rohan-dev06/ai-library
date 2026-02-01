import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, Camera, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SmartSearchBar = ({ onSearch, loading, initialValue = '' }) => {
    const [query, setQuery] = useState(initialValue);
    const [isListening, setIsListening] = useState(false);
    const fileInputRef = useRef(null);

    // Voice Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    useEffect(() => {
        if (recognition) {
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                handleSearch(transcript, null, 'voice');
            };
            recognition.onerror = (event) => {
                console.error("Speech Error", event.error);
                toast.error("Voice recognition failed.");
                setIsListening(false);
            };
        }
    }, [recognition]);

    const handleSearch = (text, file, type) => {
        onSearch({ query: text, file, type });
    };

    const toggleListening = () => {
        if (!recognition) {
            toast.error("Browser does not support voice search.");
            return;
        }
        if (isListening) recognition.stop();
        else recognition.start();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleSearch('', file, 'image');
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className={`
                flex items-center gap-2 bg-white dark:bg-[#1e1e1e] 
                border-2 rounded-2xl px-4 py-3 shadow-lg 
                transition-all duration-300
                ${isListening ? 'border-red-500 ring-4 ring-red-500/20' : 'border-transparent focus-within:border-blue-500'}
            `}>
                <Search className="w-5 h-5 text-gray-400" />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(query, null, 'text')}
                    placeholder={isListening ? "Listening..." : "Search by Title, Author, or 'Books for beginners'..."}
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    disabled={loading}
                />

                {query && (
                    <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                )}

                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                <button
                    onClick={toggleListening}
                    className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Voice Search"
                >
                    <Mic className="w-5 h-5" />
                </button>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"
                    title="Search by Image"
                >
                    <Camera className="w-5 h-5" />
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>

            {loading && (
                <div className="absolute right-0 -bottom-8 flex items-center gap-2 text-sm text-blue-500 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Smart Search...
                </div>
            )}
        </div>
    );
};

export default SmartSearchBar;
