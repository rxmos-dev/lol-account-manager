const express = require('express');
const { getPuuid } = require('../controllers');

const router = express.Router();

router.post('/puuid', getPuuid);

router.get('/', (req, res) => {
    res.send('Welcome to the League of Legends API');
});

module.exports = router;
