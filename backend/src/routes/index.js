const express = require('express');
const { getPuuid, getElo, getChampionMasteries, getSummonerLane } = require('../controllers');

const router = express.Router();

router.post('/puuid', getPuuid);

router.post('/elo', getElo);

router.post('/summoner-lane', getSummonerLane);

router.post('/champion-masteries', getChampionMasteries);

router.get('/', (req, res) => {
    res.send('Welcome to the League of Legends API');
});

module.exports = router;
