import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Moon, Sun, Bookmark, BookmarkPlus, Highlighter, StickyNote, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Setup PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const ReadBook = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [inputPage, setInputPage] = useState(1); // Local state for input
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [highlights, setHighlights] = useState([]);
    const [showHighlightPanel, setShowHighlightPanel] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [highlightColor, setHighlightColor] = useState('#FFEB3B');
    const lastTimeRef = useRef(Date.now());
    const toastShownRef = useRef(false); // Prevent double toasts

    // Text Mode State
    const [viewMode, setViewMode] = useState('pdf'); // 'pdf' or 'text'
    const [textContent, setTextContent] = useState(null);
    const [loadingText, setLoadingText] = useState(false);

    // 1. Fetch Book Details
    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await axios.get('/api/library/books');
                const foundBook = res.data.find(b => b.id === Number(id));

                if (foundBook) {
                    setBook(foundBook);
                } else {
                    toast.error("Book not found");
                    navigate('/browse');
                }
                setLoading(false);
            } catch (error) {
                console.error("Error loading reader", error);
                setLoading(false);
            }
        };
        fetchBook();
    }, [id, navigate]);

    // 2. Fetch Progress & Highlights (Requires Token)
    useEffect(() => {
        if (!token || !book) return;

        const fetchData = async () => {
            try {
                // Progress
                const progressRes = await axios.get(`/api/library/progress/${id}`, {
                    headers: { Authorization: token }
                });
                if (progressRes.data && progressRes.data.lastPage) {
                    setPageNumber(progressRes.data.lastPage);
                    if (!toastShownRef.current) {
                        toast.success(`Resumed at page ${progressRes.data.lastPage}`);
                        toastShownRef.current = true;
                    }
                }

                // Highlights
                const highlightsRes = await axios.get(`/api/highlights/${id}`, {
                    headers: { Authorization: token }
                });
                setHighlights(highlightsRes.data);

            } catch (err) {
                console.error("Data fetch error", err);
            }
        };
        fetchData();
    }, [id, token, book]);

    // 3. Fetch Text Content (Text Mode)
    useEffect(() => {
        const fetchText = async () => {
            if (viewMode === 'text') {
                setLoadingText(true);
                try {
                    const res = await axios.get(`/api/library/book/${id}/content?page=${pageNumber}`);
                    setTextContent(res.data);
                    if (res.data.totalPages) setNumPages(res.data.totalPages);
                } catch (error) {
                    // console.error("Fetch text error", error);
                    // toast.error("Text content not available for this page");
                    setTextContent(null);
                } finally {
                    setLoadingText(false);
                }
            }
        };
        fetchText();
    }, [viewMode, pageNumber, id]);

    // 4. Save Progress (Periodic)
    useEffect(() => {
        if (!token) return;

        const saveProgress = async () => {
            const now = Date.now();
            const duration = Math.floor((now - lastTimeRef.current) / 1000);
            if (duration < 1) return;

            try {
                await axios.post('/api/library/progress', {
                    bookId: id,
                    page: pageNumber,
                    totalPages: numPages,
                    duration
                }, { headers: { Authorization: token } });
                lastTimeRef.current = now;
            } catch (error) {
                console.error("Save progress failed", error);
            }
        };

        const interval = setInterval(saveProgress, 5000);
        return () => {
            clearInterval(interval);
            saveProgress();
        };
    }, [pageNumber, numPages, id, token]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    // Sync inputPage when pageNumber changes externally (e.g. via buttons)
    useEffect(() => {
        setInputPage(pageNumber);
    }, [pageNumber]);

    const handlePageSubmit = (e) => {
        if (e.key === 'Enter' || e.type === 'blur') {
            let val = parseInt(inputPage);
            if (isNaN(val)) val = pageNumber;
            val = Math.min(Math.max(1, val), numPages || 1);
            setPageNumber(val);
            setInputPage(val);
        }
    };


    const changePage = (offset) => {
        setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages || 1));
    };

    const toggleTheme = () => setDarkMode(!darkMode);

    // Highlight Handlers
    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text) {
            setSelectedText(text);
        }
    };

    const addHighlight = async () => {
        if (!selectedText) {
            toast.error('Please select some text first');
            return;
        }

        if (!token) {
            toast.error('Please login to add highlights');
            return;
        }

        try {
            // Capture position data for visual overlay
            const selection = window.getSelection();
            let position = {};

            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rects = range.getClientRects();

                // Get the PDF page container to calculate relative positions
                const pageContainer = document.querySelector('.react-pdf__Page');
                const pageRect = pageContainer ? pageContainer.getBoundingClientRect() : null;

                if (pageRect) {
                    // Store rectangles relative to the page container
                    position = {
                        rects: Array.from(rects).map(rect => ({
                            top: rect.top - pageRect.top,
                            left: rect.left - pageRect.left,
                            width: rect.width,
                            height: rect.height
                        }))
                    };
                }
            }

            const res = await axios.post('/api/highlights/add', {
                bookId: id,
                page: pageNumber,
                text: selectedText,
                color: highlightColor,
                type: 'highlight',
                position
            }, { headers: { Authorization: token } });

            setHighlights([...highlights, res.data.highlight]);
            setSelectedText('');
            toast.success('Highlight added');
            window.getSelection().removeAllRanges();
        } catch (error) {
            console.error('Add highlight error:', error);
            toast.error(error.response?.data?.message || 'Failed to add highlight');
        }
    };

    const addBookmark = async () => {
        if (!token) {
            toast.error('Please login to add bookmarks');
            return;
        }

        // Check if already bookmarked
        const existing = highlights.find(h => h.type === 'bookmark' && h.page === pageNumber);
        if (existing) {
            toast.error('Page already bookmarked');
            return;
        }

        try {
            const res = await axios.post('/api/highlights/add', {
                bookId: id,
                page: pageNumber,
                type: 'bookmark',
                note: `Page ${pageNumber}`
            }, { headers: { Authorization: token } });

            setHighlights([...highlights, res.data.highlight]);
            toast.success('Bookmark added');
        } catch (error) {
            console.error('Add bookmark error:', error);
            toast.error(error.response?.data?.message || 'Failed to add bookmark');
        }
    };

    const deleteHighlight = async (highlightId) => {
        if (!token) return;

        try {
            await axios.delete(`/api/highlights/${highlightId}`, {
                headers: { Authorization: token }
            });

            setHighlights(highlights.filter(h => h._id !== highlightId));
            toast.success('Deleted');
        } catch (error) {
            toast.error('Failed to delete');
            console.error(error);
        }
    };

    const goToPage = (page) => {
        setPageNumber(page);
        setShowHighlightPanel(false);
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Reader...</div>;

    if (!book || !book.fileUrl) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-center p-4">
        <div>
            <h2 className="text-xl">Book content not available.</h2>
            <p className="text-gray-400 mt-2">This book might be a physical copy or missing the PDF file.</p>
            <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 rounded">Go Back</button>
        </div>
    </div>;

    return (
        <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#1a1a1a] text-gray-200' : 'bg-gray-100 text-gray-800'}`}>

            {/* Toolbar */}
            <div className={`h-16 border-b flex items-center justify-between px-4 z-10 shadow-md ${darkMode ? 'bg-[#252525] border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/browse')} className="p-2 hover:bg-gray-700/20 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold truncate max-w-[200px] sm:max-w-md hidden sm:block">{book.title}</h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-700/10 rounded-lg p-1 mr-2">
                        <button
                            onClick={() => setViewMode('pdf')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'pdf' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                        >
                            PDF
                        </button>
                        <button
                            onClick={() => setViewMode('text')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'text' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                        >
                            TEXT
                        </button>
                    </div>

                    {/* Page Controls */}
                    <div className="flex items-center gap-2 bg-gray-700/10 rounded-lg px-2 py-1">
                        <button disabled={pageNumber <= 1} onClick={() => changePage(-1)} className="p-1 hover:text-blue-500 disabled:opacity-30">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={1}
                                max={numPages || 1}
                                value={inputPage}
                                onChange={(e) => setInputPage(e.target.value)}
                                onKeyDown={handlePageSubmit}
                                onBlur={handlePageSubmit}
                                className="w-12 bg-transparent text-center font-mono text-sm focus:outline-none border-b border-gray-500 focus:border-blue-500 appearance-none m-0"
                            />
                            <span className="text-sm font-mono text-gray-500">/ {numPages || '--'}</span>
                        </div>
                        <button disabled={pageNumber >= numPages} onClick={() => changePage(1)} className="p-1 hover:text-blue-500 disabled:opacity-30">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-500/20 hidden sm:block"></div>

                    {/* Zoom */}
                    <div className="flex items-center gap-1 hidden sm:flex">
                        <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))} className="p-2 hover:bg-gray-700/20 rounded-full">
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(2.5, s + 0.2))} className="p-2 hover:bg-gray-700/20 rounded-full">
                            <ZoomIn className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-500/20 hidden sm:block"></div>

                    {/* Highlight Tools */}
                    <div className="flex items-center gap-1">
                        {selectedText && (
                            <button onClick={addHighlight} className="p-2 hover:bg-yellow-500/20 rounded-full text-yellow-500" title="Highlight">
                                <Highlighter className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={addBookmark} className="p-2 hover:bg-blue-500/20 rounded-full" title="Bookmark Page">
                            <BookmarkPlus className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowHighlightPanel(!showHighlightPanel)}
                            className={`p-2 rounded-full ${showHighlightPanel ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-gray-700/20'}`}
                            title="Show Highlights"
                        >
                            <StickyNote className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-500/20 hidden sm:block"></div>

                    {/* Theme */}
                    <button onClick={toggleTheme} className="p-2 hover:bg-gray-700/20 rounded-full">
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Reader Area */}
            <div className="flex-1 overflow-auto flex justify-center p-4 sm:p-8 relative">
                <style>{`
                    .react-pdf__Page__textContent ::selection {
                        background-color: rgba(255, 235, 59, 0.4) !important;
                    }
                    .react-pdf__Page__textContent mark {
                        background-color: rgba(255, 235, 59, 0.4);
                        padding: 0;
                    }
                `}</style>

                <div className={`relative shadow-2xl transition-transform duration-200 ${darkMode && viewMode === 'pdf' ? 'brightness-90 invert-[.05]' : ''}`} onMouseUp={handleTextSelection}>
                    {viewMode === 'pdf' ? (
                        <>
                            <Document
                                file={book.fileUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="animate-pulse text-center p-10">Loading PDF...</div>}
                                error={<div className="text-red-500 p-10">Failed to load PDF. Link broken or protected.</div>}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className="shadow-xl"
                                />
                            </Document>

                            {/* Visual Highlight Overlays - Only show on current page */}
                            {highlights
                                .filter(h => h.type === 'highlight' && h.page === pageNumber && h.position?.rects)
                                .map(highlight => (
                                    <div key={highlight._id}>
                                        {highlight.position.rects.map((rect, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    position: 'absolute',
                                                    top: `${rect.top}px`,
                                                    left: `${rect.left}px`,
                                                    width: `${rect.width}px`,
                                                    height: `${rect.height}px`,
                                                    backgroundColor: `${highlight.color}66`,
                                                    pointerEvents: 'none',
                                                    mixBlendMode: 'multiply',
                                                    zIndex: 1
                                                }}
                                                className="transition-opacity duration-200"
                                            />
                                        ))}
                                    </div>
                                ))
                            }
                        </>
                    ) : (
                        <div className={`w-full max-w-3xl mx-auto p-8 min-h-[80vh] shadow-xl ${darkMode ? 'bg-[#1e1e1e] text-gray-300' : 'bg-white text-gray-800'}`}>
                            {loadingText ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-gray-700/20 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-700/20 rounded w-full"></div>
                                    <div className="h-4 bg-gray-700/20 rounded w-5/6"></div>
                                </div>
                            ) : textContent ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <h3 className="text-xl font-bold mb-4 text-center text-gray-500">{textContent.title}</h3>
                                    <p className="whitespace-pre-wrap text-lg leading-relaxed font-serif">
                                        {textContent.text}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-500">
                                    <p>No text content available for this page.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Highlights Sidebar */}
                {showHighlightPanel && (
                    <div className={`fixed right-0 top-16 bottom-0 w-80 ${darkMode ? 'bg-[#252525] border-l border-gray-700' : 'bg-white border-l border-gray-200'} shadow-2xl overflow-y-auto z-20`}>
                        <div className="sticky top-0 bg-inherit p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Highlights & Bookmarks</h3>
                            <button onClick={() => setShowHighlightPanel(false)} className="p-1 hover:bg-gray-700/20 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Bookmarks */}
                            {highlights.filter(h => h.type === 'bookmark').length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-400 mb-2 flex items-center gap-2">
                                        <Bookmark className="w-4 h-4" /> Bookmarks
                                    </h4>
                                    {highlights.filter(h => h.type === 'bookmark').map(bookmark => (
                                        <div key={bookmark._id} className="p-3 bg-blue-500/10 rounded-lg mb-2 border border-blue-500/20">
                                            <div className="flex justify-between items-start">
                                                <button
                                                    onClick={() => goToPage(bookmark.page)}
                                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                                >
                                                    Page {bookmark.page}
                                                </button>
                                                <button onClick={() => deleteHighlight(bookmark._id)} className="text-red-400 hover:text-red-300">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Highlights */}
                            {highlights.filter(h => h.type === 'highlight').length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-400 mb-2 flex items-center gap-2">
                                        <Highlighter className="w-4 h-4" /> Highlights
                                    </h4>
                                    {highlights.filter(h => h.type === 'highlight').map(highlight => (
                                        <div key={highlight._id} className="p-3 bg-gray-700/30 rounded-lg mb-2 border border-gray-600">
                                            <div className="flex justify-between items-start mb-2">
                                                <button
                                                    onClick={() => goToPage(highlight.page)}
                                                    className="text-xs text-gray-400 hover:text-gray-300"
                                                >
                                                    Page {highlight.page}
                                                </button>
                                                <button onClick={() => deleteHighlight(highlight._id)} className="text-red-400 hover:text-red-300">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-300 italic line-clamp-3">{highlight.text}</p>
                                            {highlight.note && (
                                                <p className="text-xs text-gray-500 mt-2 border-l-2 border-yellow-500 pl-2">{highlight.note}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {highlights.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No highlights or bookmarks yet</p>
                                    <p className="text-xs mt-1">Select text to highlight</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ReadBook;
