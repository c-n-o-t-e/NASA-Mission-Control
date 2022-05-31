const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
    console.log('Downloading launch data...');
    const response = await axios.post(SPACEX_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads']
        const customer = payloads.flatMap((payload) => {
            return payload['customers']
        })

        const launch  = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customer: customer
        }

        saveLaunch(launch);
    }
}

async function loadLaunchData() {
    const first = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    if(first) {
        console.log('already saved')
    } else {
        await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launches.findOne(filter)
}

async function getAllLaunches(skip, limit) {
  return await launches
    .find({}, { '_id': 0, '__v': 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches
    .findOne()
    .sort('-flightNumber'); //descending order

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function saveLaunch(launch) {
    await launches.findOneAndUpdate({
        flightNumber:launch.flightNumber
    }, launch, {
        upsert: true
    });
}

async function addNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.destination
    });

    if (!planet) {
        throw new Error('no matching planet found')
    }
    const latestFlightNumber = await getLatestFlightNumber() + 1;
    
    Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: latestFlightNumber
    })

    saveLaunch(launch);
}

async function checkLaunch(id) {
    return await launches.findOne({
        flightNumber: id
    })
}

async function deleteLaunch(id) {
    const aborted = await launches.updateOne({
        flightNumber: id
    },{
            upcoming: false,
            success: false
        }
    );

    return aborted.acknowledged === true && aborted.modifiedCount === 1;
}

module.exports = {
    getAllLaunches,
    addNewLaunch,
    deleteLaunch,
    checkLaunch,
    loadLaunchData
}