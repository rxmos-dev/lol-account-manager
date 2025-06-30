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
        data.puuid = data.puuid.toLowerCase(); // Normalizando o PUUID para minúsculas
        res.json(data.puuid);

    } catch (error) {
        console.error('Erro ao buscar dados da Riot API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Riot API', details: error.message });
    }
};

module.exports = {
    getPuuid,
};
