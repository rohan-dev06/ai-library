const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Prereq: Ensure we have a dummy pdf
const pdfPath = path.join(__dirname, '../uploads/pythonds.pdf');
if (!fs.existsSync(pdfPath)) {
    console.error('Test PDF not found at', pdfPath);
    process.exit(1);
}

const testUpload = async () => {
    try {
        const form = new FormData();
        form.append('id', '9999');
        form.append('title', 'Test Upload User');
        form.append('author', 'Tester');
        form.append('isbn', '1234567890');
        form.append('bookPdf', fs.createReadStream(pdfPath));
        form.append('bookType', 'EBOOK');

        // Need Admin Token. 
        // We can simulate it if we have the secret, or Login first.
        // Let's login as admin.
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@gmail.com', // Admin credential from Verify UI step
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Got Admin Token');

        const res = await axios.post('http://localhost:5000/api/admin/add-book', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': token
            }
        });

        console.log('Upload Success:', res.data);

    } catch (error) {
        console.error('Upload Failed Status:', error.response?.status);
        console.error('Upload Failed Data:', error.response?.data);
        if (!error.response) console.error(error);
    }
};

testUpload();
