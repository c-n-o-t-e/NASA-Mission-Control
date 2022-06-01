const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDiscount } = require('../../services/mongo');
const { loadPlanetsData } = require('../../model/planets.model')

describe('Launches API', () => {
    beforeEach(async () => {
        await mongoConnect();
        await loadPlanetsData();
    });

    afterAll(async () => {
        await mongoDiscount();
    });

    describe('Test GET /v1/launches', () => {
        test('it should respond with 200 success', async () => {
            const response = await request(app)
            .get('/v1/launches')
            .expect('Content-Type', /json/)
            .expect(200);
        });
    });

    describe('Test POST /v1/launches', () => {
        const completeLaunchData = {
            mission: "Kepler Exploration X",
            rocket: "Explorer IS1",
            launchDate: 'December 27, 2030',
            destination: 'Kepler-442 b'
        }

        const completeLaunchWithoutDate = {
            mission: "Kepler Exploration X",
            rocket: "Explorer IS1",
            destination: 'Kepler-442 b'
        }

        const completeLaunchWithAnInvalidDate = {
            mission: "Kepler Exploration X",
            rocket: "Explorer IS1",
            launchDate: 'Invalid date',
            destination: 'Kepler-442 b'
        }

        test('it should respond with 201 success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf()
            const responseDate = new Date(response.body.launchDate).valueOf();

            expect(response.body).toMatchObject(completeLaunchWithoutDate);
            expect(requestDate).toBe(responseDate);
        
        });

        test('it should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Missing required launch property'
            });
        });

        test('it should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchWithAnInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Missing required launch property'
            });
        });
    });

    describe('Test DELETE /v1/launches', () => {
        const completeLaunchData = {
            mission: "Kepler Exploration X",
            rocket: "Explorer IS1",
            launchDate: 'December 27, 2030',
            destination: 'Kepler-296 A f'
        }

        test('it should delete launch data', async () => {
            await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);
            
            await request(app)
                .delete('/v1/launches/4')
                .expect('Content-Type', /json/)
                .expect(200);
        });

        test('it should fail to delete invalid id', async () => {
            const response = await request(app)
                .delete('/v1/launches/199')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toStrictEqual({
                error: 'Launch not found'
            });
        });
    })
})
