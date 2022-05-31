const { getAllLaunches, addNewLaunch, deleteLaunch, checkLaunch } = require('../../model/launches.model');
const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit);
    return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
    let launch = req.body;
    launch.launchDate = new Date(launch.launchDate);

    if (!launch.mission || !launch.rocket || isNaN(launch.launchDate)
        || !launch.destination){
            return res.status(400).json({
                error: 'Missing required launch property'
            });
        };

    await addNewLaunch(launch);
    res.status(201).json(launch);
}

async function httpDeleteLaunch(req, res) {
    const launchId = +req.params.id;
    const existLaunch = await checkLaunch(launchId)

    if (!existLaunch) {
        return res.status(404).json({
            error: 'Launch not found'
        });
    }
    const aborted = await deleteLaunch(launchId);

    if (!aborted) {
        return res.status(400).json({
            error: 'Launch not aborted'
        });
    }
    
    return res.status(200).json({
        ok: true
    });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpDeleteLaunch,
}