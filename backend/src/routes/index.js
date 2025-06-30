const express = require('express');
const { getPuuid, getElo, getChampionMasteries, getSummonerLane, clearCache, getCacheStats } = require('../controllers');

const router = express.Router();

router.post('/puuid', getPuuid);

router.post('/elo', getElo);

router.post('/summoner-lane', getSummonerLane);

router.post('/champion-masteries', getChampionMasteries);

// Rotas para gerenciar cache
router.delete('/cache', clearCache);
router.get('/cache/stats', getCacheStats);

router.get('/', (req, res) => {
    res.send('Welcome to the League of Legends API - Versão Otimizada com Cache');
});

module.exports = router;
