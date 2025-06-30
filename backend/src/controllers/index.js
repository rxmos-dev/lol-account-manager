const fetch = require('node-fetch');

const getPuuid = async (req, res) => {
    const { summonerName, tagline } = req.body;
    const riotApiKey = process.env.RIOT_API_KEY;

    if (!summonerName || !tagline) {
        return res.status(400).json({ error: 'summonerName e tagline são obrigatórios no body da requisição' });
    }

    if (!riotApiKey) {
        return res.status(500).json({ error: 'API Key da Riot não foi configurada' });
    }

    try {
        const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagline}`;

        const response = await fetch(url, {
            headers: { 'X-Riot-Token': riotApiKey },
        });

        if (!response.ok) {
            const errorData = await response.json();


            return res.status(response.status).json({ error: errorData });
        }

        const data = await response.json();
        const puuid = data.puuid;
        res.json({ puuid });

    } catch (error) {
        console.error('Erro ao buscar dados da Riot API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Riot API', details: error.message });
    }
};

const getElo = async (req, res) => {
    const { summonerName, tagline } = req.body;
    const riotApiKey = process.env.RIOT_API_KEY;

    if (!summonerName || !tagline) {
        return res.status(400).json({ error: 'summonerName e tagline são obrigatórios no body da requisição' });
    }

    if (!riotApiKey) {
        return res.status(500).json({ error: 'API Key da Riot não foi configurada' });
    }

    try {
        // Primeiro, obter o PUUID
        const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagline}`;

        const accountResponse = await fetch(accountUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        });

        if (!accountResponse.ok) {
            const errorData = await accountResponse.json();
            return res.status(accountResponse.status).json({ error: errorData });
        }

        const accountData = await accountResponse.json();
        const puuid = accountData.puuid;

        // Obter informações de ranking usando o summoner ID
        const rankedUrl = `https://br1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;

        const rankedResponse = await fetch(rankedUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        });

        if (!rankedResponse.ok) {
            const errorData = await rankedResponse.json();
            return res.status(rankedResponse.status).json({ error: errorData });
        }

        const rankedData = await rankedResponse.json();

        res.json({
            elo: rankedData.map(entry => ({
                queueType: entry.queueType,
                tier: entry.tier,
                rank: entry.rank,
                leaguePoints: entry.leaguePoints,
                wins: entry.wins,
                losses: entry.losses,
            })),
        });

    } catch (error) {
        console.error('Erro ao buscar dados da Riot API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Riot API', details: error.message });
    }
};

const getChampionMasteries = async (req, res) => {
    const { summonerName, tagline } = req.body;
    const riotApiKey = process.env.RIOT_API_KEY;

    if (!summonerName || !tagline) {
        return res.status(400).json({ error: 'summonerName e tagline são obrigatórios no body da requisição' });
    }

    if (!riotApiKey) {
        return res.status(500).json({ error: 'API Key da Riot não foi configurada' });
    }

    try {
        // Primeiro, obter o PUUID
        const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagline}`;

        const accountResponse = await fetch(accountUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        });

        if (!accountResponse.ok) {
            const errorData = await accountResponse.json();
            return res.status(accountResponse.status).json({ error: errorData });
        }

        const accountData = await accountResponse.json();
        const puuid = accountData.puuid;

        const championMasteriesUrl = `https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`;

        const championMasteriesResponse = await fetch(championMasteriesUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        });

        if (!championMasteriesResponse.ok) {
            const errorData = await championMasteriesResponse.json();
            return res.status(championMasteriesResponse.status).json({ error: errorData });
        }

        const championMasteriesData = await championMasteriesResponse.json();

        // Ordenar por championLevel (decrescente) e pegar os top 3
        const top3Champions = championMasteriesData
            .sort((a, b) => b.championLevel - a.championLevel)
            .slice(0, 3)
            .map(mastery => ({
                championId: mastery.championId,
                championLevel: mastery.championLevel,
                championPoints: mastery.championPoints,
                lastPlayTime: mastery.lastPlayTime,
            }));

        res.json({
            championMasteriesData: top3Champions
        });

    } catch (error) {
        console.error('Erro ao buscar dados da Riot API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Riot API', details: error.message });
    }
};

module.exports = {
    getPuuid,
    getElo,
    getChampionMasteries
};
