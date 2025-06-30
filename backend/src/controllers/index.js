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
        const puuid = data.puuid.toLowerCase(); // Normalizando o PUUID para minúsculas
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
        const puuid = accountData.puuid.toLowerCase();

        // Obter informações do summoner usando o PUUID
        const summonerUrl = `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        
        const summonerResponse = await fetch(summonerUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        });

        if (!summonerResponse.ok) {
            const errorData = await summonerResponse.json();
            return res.status(summonerResponse.status).json({ error: errorData });
        }

        const summonerData = await summonerResponse.json();

        // Obter informações de ranking usando o summoner ID
        const rankedUrl = `https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`;
        
        const rankedResponse = await fetch(rankedUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        });

        if (!rankedResponse.ok) {
            const errorData = await rankedResponse.json();
            return res.status(rankedResponse.status).json({ error: errorData });
        }

        const rankedData = await rankedResponse.json();
        
        res.json({
            summoner: summonerData,
            ranks: rankedData
        });

    } catch (error) {
        console.error('Erro ao buscar dados da Riot API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Riot API', details: error.message });
    }
};


module.exports = {
    getPuuid,
    getElo,
};
