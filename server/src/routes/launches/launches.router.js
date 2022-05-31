const { Router } = require('express');
const launchesRouter = Router();
const { httpGetAllLaunches, 
    httpAddNewLaunch,
httpDeleteLaunch } = require('./launches.controller')

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.delete('/:id', httpDeleteLaunch);

module.exports = launchesRouter;