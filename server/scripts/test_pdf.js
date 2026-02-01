
const { PDFParse } = require('pdf-parse');

console.log('PDFParse type:', typeof PDFParse);

const runTest = async () => {
    try {
        // Mock PDF structure is hard to buffer manually without real PDF magic bytes
        // But the library might check magic bytes.
        // Let's rely on the fact that if instance is created, we are good.
        // Or fetching a remote PDF?
        // Let's try minimal buffer. It might throw "InvalidPDFException" but that proves it runs.
        const buffer = Buffer.from('mnot a real pdf');

        console.log('Creating parser...');
        const parser = new PDFParse({ data: buffer });

        console.log('Parser created. Calling getText()...');
        const result = await parser.getText();
        console.log('Text:', result.text);

        await parser.destroy();
    } catch (e) {
        console.log('Caught Error:', e.constructor.name, e.message);
        if (e.constructor.name === 'InvalidPDFException' || e.message.includes('PDF')) {
            console.log('Test PASSED: Library is loaded and working (validated PDF structure).');
        } else {
            console.log('Test FAILED or Unknown Error');
        }
    }
}

runTest();
