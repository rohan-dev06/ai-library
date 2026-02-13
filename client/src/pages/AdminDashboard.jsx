import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import ManageBooks from '../components/admin/ManageBooks';
import ManageUsers from '../components/admin/ManageUsers';
import PaymentHistory from '../components/admin/PaymentHistory';
import ManageReviews from '../components/admin/ManageReviews';

const AdminDashboard = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('add');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isbnInput, setIsbnInput] = useState('');

    const [bookData, setBookData] = useState({
        id: '',
        title: '',
        author: '',
        publisher: '',
        authorBio: '',
        description: '',
        image: '',

        pages: 0,
        language: 'English',
        tags: '',
        available: true,
        bookPdf: null,
        bookType: 'EBOOK'
    });

    // Basic protection
    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-red-500">Access Denied</h2>
                    <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-blue-600 rounded">Go Home</button>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        if (e.target.name === 'pages' && e.target.value !== '' && e.target.value < 1) return; // Prevent negative or zero pages, but allow empty for typing
        setBookData({ ...bookData, [e.target.name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 30 * 1024 * 1024) {
                toast.error('File size exceeds 30MB limit');
                e.target.value = null; // Reset input
                return;
            }
            setBookData({ ...bookData, bookPdf: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploadProgress(0);

        try {
            const formData = new FormData();
            Object.keys(bookData).forEach(key => {
                if (key === 'bookPdf') {
                    if (bookData.bookPdf) formData.append('bookPdf', bookData.bookPdf);
                } else if (key === 'tags') {
                    formData.append('tags', bookData.tags.split(',').map(tag => tag.trim()).filter(t => t).join(','));
                } else if (key === 'pages') {
                    formData.append(key, String(bookData[key]));
                } else if (key !== 'id') { // Skip empty ID
                    formData.append(key, bookData[key]);
                }
            });
            formData.append('isbn', isbnInput);

            const res = await axios.post('/api/admin/add-book', formData, {
                headers: { Authorization: token },
                timeout: 300000, // 5 minutes timeout
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            toast.success(res.data.message);
            setBookData({
                id: '', title: '', author: '', publisher: '', authorBio: '', description: '', image: '', pages: 0, language: 'English', tags: '', available: true, bookPdf: null, bookType: 'EBOOK'
            });
            setIsbnInput('');
            setUploadProgress(0);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add book');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchISBN = async () => {
        if (!isbnInput) {
            toast.error('Please enter an ISBN');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/api/admin/fetch-metadata',
                { isbn: isbnInput },
                { headers: { 'Authorization': token } }
            );
            const { metadata } = res.data;
            toast.success('Metadata fetched!');
            setBookData(prev => ({ ...prev, ...metadata, tags: metadata.tags }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch metadata');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <AdminNavbar />
            <div className="pt-8 px-4 md:px-8 pb-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-green-500">Admin Dashboard</h1>
                </div>

                {/* Tab Navigation */}
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 md:gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${activeTab === 'add'
                            ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <span className="mr-2">➕</span> Add Book
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${activeTab === 'manage'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <span className="mr-2">📚</span> Manage Books
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${activeTab === 'users'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <span className="mr-2">👥</span> Users
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${activeTab === 'payments'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <span className="mr-2">💳</span> Payments
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${activeTab === 'reviews'
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <span className="mr-2">⭐</span> Reviews
                    </button>
                </div>

                {activeTab === 'manage' ? (
                    <ManageBooks />
                ) : activeTab === 'users' ? (
                    <ManageUsers />
                ) : activeTab === 'payments' ? (
                    <PaymentHistory />
                ) : activeTab === 'reviews' ? (
                    <ManageReviews />
                ) : (
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <span className="mr-2">✨</span> Add New Book
                        </h2>
                        {/* ... (keep existing form content) */}

                        <div className="mb-8 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <h3 className="text-sm font-bold text-blue-400 mb-3 uppercase tracking-wider">🚀 Auto-Fill via ISBN (Optional)</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    value={isbnInput}
                                    onChange={(e) => setIsbnInput(e.target.value)}
                                    placeholder="Enter ISBN (Optional - or enter manually below)"
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded p-2 focus:border-blue-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleFetchISBN}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50 transition-colors w-full sm:w-auto"
                                >
                                    {loading ? 'Fetching...' : 'Fetch Data'}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ISBN (Hidden or Editable?) - Let's allow edit but auto-fill */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium mb-1 text-gray-400">ISBN (Auto-filled or Empty)</label>
                                <input
                                    type="text"
                                    name="isbn"
                                    value={isbnInput} // Should we sync this? Or separate? Let's use separate field.
                                    disabled
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded p-2 text-gray-500 cursor-not-allowed"
                                    placeholder="ISBN (Optional)"
                                />
                            </div>



                            {/* Title */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium mb-1 text-gray-400">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={bookData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:border-green-500 focus:outline-none"
                                    placeholder="Book Title"
                                />
                            </div>

                            {/* Author */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium mb-1 text-gray-400">Author</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={bookData.author}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:border-green-500 focus:outline-none"
                                    placeholder="Author Name"
                                />
                            </div>

                            {/* Publisher */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium mb-1 text-gray-400">Publisher</label>
                                <input
                                    type="text"
                                    name="publisher"
                                    value={bookData.publisher}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:border-green-500 focus:outline-none"
                                    placeholder="Publisher Name"
                                />
                            </div>

                            {/* Image URL */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium mb-1 text-gray-400">Image URL</label>
                                <input
                                    type="text"
                                    name="image"
                                    value={bookData.image}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:border-green-500 focus:outline-none"
                                    placeholder="https://example.com/cover.jpg"
                                />
                            </div>

                            {/* Description - Full Width */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1 text-gray-400">Description</label>
                                <textarea
                                    name="description"
                                    value={bookData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:border-green-500 focus:outline-none"
                                    placeholder="Brief summary of the book..."
                                ></textarea>
                            </div>

                            {/* Author Bio - Full Width */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1 text-gray-400">About Author</label>
                                <textarea
                                    name="authorBio"
                                    value={bookData.authorBio}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:border-green-500 focus:outline-none"
                                    placeholder="Short bio of the author..."
                                ></textarea>
                            </div>

                            {/* Details Row */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium mb-1 text-gray-400">Pages</label>
                                <input
                                    type="number"
                                    name="pages"
                                    value={bookData.pages}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:border-green-500 focus:outline-none"
                                    min="1"
                                />
                            </div>

                            {/* E-Book Fields Row */}
                            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                                {/* PDF File Upload */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold mb-1 text-blue-400">Upload PDF E-Book</label>
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-500 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <p className="mb-2 text-sm text-gray-400">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">PDF or EPUB (MAX. 30MB)</p>
                                                {bookData.bookPdf && <p className="mt-2 text-green-400 font-bold">{bookData.bookPdf.name}</p>}
                                            </div>
                                            <input id="dropzone-file" type="file" className="hidden" accept=".pdf,.epub" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium mb-1 text-gray-400">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={bookData.tags}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:border-green-500 focus:outline-none"
                                    placeholder="fiction, sci-fi, classic"
                                />
                            </div>

                            {/* Submit */}
                            <div className="col-span-2 mt-4">
                                {loading && uploadProgress > 0 && (
                                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                        <p className="text-xs text-green-400 text-center mt-1">Uploading: {uploadProgress}%</p>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 rounded shadow-lg transform transition hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (uploadProgress === 100 ? 'Finalizing Upload... (Please Wait)' : uploadProgress > 0 ? `Uploading Book (${uploadProgress}%)` : 'Processing...') : 'Add Book to Library'}
                                </button>
                            </div>


                        </form>
                    </div>
                )}
            </div>
        </div>

    );
};

export default AdminDashboard;
