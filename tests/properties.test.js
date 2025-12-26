const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const propertyRoutes = require('../routes/propertyRoutes');
const Property = require('../models/Property');

const app = express();
app.use(express.json());
app.use('/api/properties', propertyRoutes);

describe('GET /api/properties', () => {
    beforeAll(async () => {
        // Connect to a test database (mock or in-memory recommended usually, here just assuming local test db)
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/real_estate_test');
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Property.deleteMany({});
    });

    it('should return empty list initially', async () => {
        const res = await request(app).get('/api/properties');
        expect(res.statusCode).toBe(200);
        expect(res.body.properties).toEqual([]);
    });

    it('should return properties after creation', async () => {
        const mockProperty = {
            title: 'Test House',
            description: 'Test Description',
            price: 100000,
            bedrooms: 2,
            bathrooms: 1,
            areaSqft: 1000,
            propertyType: 'House',
            coverImage: 'img.jpg',
            agentId: new mongoose.Types.ObjectId(),
            approvalStatus: 'approved'
        };
        await Property.create(mockProperty);

        const res = await request(app).get('/api/properties');
        expect(res.statusCode).toBe(200);
        expect(res.body.properties.length).toBe(1);
        expect(res.body.properties[0].title).toBe('Test House');
    });
});
