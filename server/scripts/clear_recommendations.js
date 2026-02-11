const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const RecommendationSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    recommendations: Array,
    updatedAt: Date
});
const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema);

if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected. Clearing recommendations cache...');

        const result = await Recommendation.deleteMany({});
        console.log(`Deleted ${result.deletedCount} recommendation cache entries.`);

        await mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });
