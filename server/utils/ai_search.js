const Tesseract = require('tesseract.js');

/**
 * Extracts text from an image buffer using Tesseract OCR
 * @param {Buffer} imageBuffer 
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromImage = async (imageBuffer) => {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imageBuffer,
            'eng',
            { logger: m => console.log(m) } // Optional: log progress
        );
        return text.trim();
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("Failed to extract text from image");
    }
};

/**
 * Analyzes natural language query to extract search intent and keywords
 * @param {string} query 
 * @returns {Object} { keywords: string[], category: string | null }
 */
const analyzeIntent = (query) => {
    const lowerQuery = query.toLowerCase();

    // 1. Keyword Mapping (Simulation of AI understanding)
    const categoryMap = {
        'mern': ['mern', 'react', 'node', 'express', 'mongodb', 'javascript', 'web development'],
        'beginner': ['intro', 'introduction', 'beginner', 'basics', 'start'],
        'python': ['python', 'django', 'flask', 'data science', 'ml'],
        'scifi': ['sci-fi', 'science fiction', 'dune', 'martian', 'space'],
        'fiction': ['fiction', 'novel', 'story'],
        'tech': ['code', 'programming', 'software', 'developer']
    };

    let detectedCategory = null;
    let expansionKeywords = [];

    // Check for categories
    for (const [key, related] of Object.entries(categoryMap)) {
        if (lowerQuery.includes(key) || related.some(r => lowerQuery.includes(r))) {
            expansionKeywords = [...expansionKeywords, ...related];
            detectedCategory = key;
        }
    }

    // 2. Remove "stop words" to find core subject
    const stopWords = ['books', 'for', 'about', 'on', 'show', 'me', 'find', 'search', 'give', 'beginner', 'beginners'];
    const words = lowerQuery.split(' ').filter(w => !stopWords.includes(w) && w.length > 2);

    // Combine detected keywords with original significant words
    const finalKeywords = [...new Set([...words, ...expansionKeywords])];

    return {
        original: query,
        keywords: finalKeywords,
        category: detectedCategory
    };
};

module.exports = { extractTextFromImage, analyzeIntent };
