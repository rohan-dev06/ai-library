import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Search, Edit, Trash2, Eye, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageBooks = () => {
    const { token } = useAuth();
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Fetch Books
    const fetchBooks = async () => {
        try {
            const res = await axios.get('/api/library/books');
            setBooks(res.data);
            setFilteredBooks(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching books", error);
            toast.error("Failed to load books");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    // Filter books on search
    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = books.filter(book =>
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery) ||
            String(book.id).includes(lowerQuery)
        );
        setFilteredBooks(filtered);
    }, [searchQuery, books]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;

        try {
            await axios.delete(`/api/admin/book/${id}`, {
                headers: { Authorization: token }
            });
            toast.success('Book deleted successfully');
            fetchBooks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete book');
        }
    };

    const handleEditClick = (book) => {
        setEditingId(book.id);
        setEditForm({ ...book });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`/api/admin/book/${editForm.id}`, editForm, {
                headers: { Authorization: token }
            });
            toast.success('Book updated successfully');
            setEditingId(null);
            fetchBooks();
        } catch (error) {
            toast.error('Failed to update book');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const toggleAvailability = async (book) => {
        try {
            await axios.put(`/api/admin/book/${book.id}`,
                { available: !book.available },
                { headers: { Authorization: token } }
            );
            toast.success(`Book marked as ${!book.available ? 'Available' : 'Unavailable'}`);
            fetchBooks();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="text-white text-center py-8">Loading books...</div>;

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-2">📚</span> Manage Library
                </h2>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by title, author, ID..."
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
                            <th className="px-4 py-3 rounded-tl-lg">ID</th>
                            <th className="px-4 py-3">Book Cover</th>
                            <th className="px-4 py-3">Title / Author</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredBooks.map((book) => (
                            <tr key={book.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 font-mono text-sm">{book.id}</td>
                                <td className="px-4 py-3">
                                    <div className="w-12 h-16 rounded overflow-hidden shadow-sm border border-gray-600">
                                        <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {editingId === book.id ? (
                                        <div className="space-y-2">
                                            <input
                                                name="title"
                                                value={editForm.title}
                                                onChange={handleEditChange}
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                                            />
                                            <input
                                                name="author"
                                                value={editForm.author}
                                                onChange={handleEditChange}
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-gray-400 focus:border-blue-500 outline-none"
                                            />
                                            <input
                                                name="publisher"
                                                value={editForm.publisher || ''}
                                                onChange={handleEditChange}
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-gray-400 focus:border-blue-500 outline-none mt-1"
                                                placeholder="Publisher"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="font-semibold text-white">{book.title}</p>
                                            <p className="text-sm text-gray-400">{book.author}</p>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => toggleAvailability(book)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${book.available
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'} transition-all`}
                                    >
                                        {book.available ? 'Available' : 'Unavailable'}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {editingId === book.id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={handleSaveEdit} className="p-2 bg-green-600 text-white rounded hover:bg-green-700" title="Save">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={handleCancelEdit} className="p-2 bg-gray-600 text-white rounded hover:bg-gray-500" title="Cancel">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(book)}
                                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book.id)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredBooks.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500">
                                    No books found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageBooks;
