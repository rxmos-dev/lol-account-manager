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

const getSummonerLane = async (req, res) => {
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

        // Obter lista de partidas (últimas 50 partidas ranked para análise)
        const matchListUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=50&type=ranked`;

        const matchListResponse = await fetch(matchListUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        });

        if (!matchListResponse.ok) {
            const errorData = await matchListResponse.json();
            return res.status(matchListResponse.status).json({ error: errorData });
        }

        const matchIds = await matchListResponse.json();

        if (matchIds.length === 0) {
            return res.json({
                mainRole: 'Sem dados suficientes',
                roleStatistics: {},
                totalMatches: 0
            });
        }

        // Contador de roles
        const roleCounters = {
            "TOP": 0,
            "JUNGLE": 0,
            "MIDDLE": 0,
            "BOTTOM": 0,
            "UTILITY": 0
        };

        let processedMatches = 0;

        // Analisar cada partida (limitando a 30 partidas para evitar rate limiting)
        const matchesToAnalyze = matchIds.slice(0, 30);

        for (const matchId of matchesToAnalyze) {
            try {
                const matchDetailUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`;

                const matchDetailResponse = await fetch(matchDetailUrl, {
                    headers: { 'X-Riot-Token': riotApiKey },
                });

                if (!matchDetailResponse.ok) {
                    console.warn(`Erro ao buscar detalhes da partida ${matchId}`);
                    continue;
                }

                const matchData = await matchDetailResponse.json();

                // Encontrar o jogador na partida
                const playerData = matchData.info.participants.find(participant => participant.puuid === puuid);

                if (playerData && playerData.individualPosition) {
                    const role = playerData.individualPosition;
                    if (roleCounters.hasOwnProperty(role)) {
                        roleCounters[role]++;
                        processedMatches++;
                    }
                }

                // Pequeno delay para evitar rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (matchError) {
                console.warn(`Erro ao processar partida ${matchId}:`, matchError.message);
                continue;
            }
        }

        // Determinar a main role
        let mainRole = 'Desconhecida';
        let maxOccurrences = 0;

        for (const [role, count] of Object.entries(roleCounters)) {
            if (count > maxOccurrences) {
                maxOccurrences = count;
                mainRole = role;
            }
        }

        // Calcular porcentagens
        const roleStatistics = {};
        for (const [role, count] of Object.entries(roleCounters)) {
            if (processedMatches > 0) {
                roleStatistics[role] = {
                    matches: count,
                    percentage: Math.round((count / processedMatches) * 100)
                };
            }
        }

        res.json({
            mainRole,
            roleStatistics,
            totalMatches: processedMatches,
            analysisNote: `Baseado nas últimas ${processedMatches} partidas ranked analisadas`
        });

    } catch (error) {
        console.error('Erro ao buscar dados da Riot API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Riot API', details: error.message });
    }
};

module.exports = {
    getPuuid,
    getElo,
    getChampionMasteries,
    getSummonerLane
};
