const http = require('http');
require('dotenv').config();

const app = require('./app');
const { loadPlanetsData } = require('./model/planets.model');
const { mongoConnect } = require('./services/mongo');
const { loadLaunchData } =  require('./model/launches.model');

const PORT = process.env.PORT;
const server = http.createServer(app);

async function startServer(){
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();

    server.listen(PORT, () => {
        console.log(`Listening on ${PORT}`)
    });  
}

startServer();

