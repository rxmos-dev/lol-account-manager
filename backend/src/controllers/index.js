const fetch = require('node-fetch');

// Cache simples em memória para economizar chamadas da API
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos em millisegundos

// Função para gerar chave do cache
const getCacheKey = (endpoint, params) => {
    return `${endpoint}-${JSON.stringify(params)}`;
};

// Função para buscar dados com cache
const fetchWithCache = async (url, options, cacheKey) => {
    // Verificar se existe no cache e não expirou
    if (cache.has(cacheKey)) {
        const { data, timestamp } = cache.get(cacheKey);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log(`Cache hit para: ${cacheKey}`);
            return { ok: true, json: () => Promise.resolve(data) };
        } else {
            cache.delete(cacheKey); // Remove cache expirado
        }
    }

    // Fazer requisição real
    const response = await fetch(url, options);
    
    if (response.ok) {
        const data = await response.json();
        // Armazenar no cache
        cache.set(cacheKey, { data, timestamp: Date.now() });
        console.log(`Cache miss - dados armazenados para: ${cacheKey}`);
        return { ok: true, json: () => Promise.resolve(data) };
    }
    
    return response;
};

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
        const cacheKey = getCacheKey('puuid', { summonerName, tagline });

        const response = await fetchWithCache(url, {
            headers: { 'X-Riot-Token': riotApiKey },
        }, cacheKey);

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
        // Primeiro, obter o PUUID (com cache)
        const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagline}`;
        const puuidCacheKey = getCacheKey('puuid', { summonerName, tagline });

        const accountResponse = await fetchWithCache(accountUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        }, puuidCacheKey);

        if (!accountResponse.ok) {
            const errorData = await accountResponse.json();
            return res.status(accountResponse.status).json({ error: errorData });
        }

        const accountData = await accountResponse.json();
        const puuid = accountData.puuid;

        // Obter informações de ranking usando o summoner ID (com cache)
        const rankedUrl = `https://br1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
        const rankedCacheKey = getCacheKey('ranked', { puuid });

        const rankedResponse = await fetchWithCache(rankedUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        }, rankedCacheKey);

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
        // Primeiro, obter o PUUID (com cache)
        const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagline}`;
        const puuidCacheKey = getCacheKey('puuid', { summonerName, tagline });

        const accountResponse = await fetchWithCache(accountUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        }, puuidCacheKey);

        if (!accountResponse.ok) {
            const errorData = await accountResponse.json();
            return res.status(accountResponse.status).json({ error: errorData });
        }

        const accountData = await accountResponse.json();
        const puuid = accountData.puuid;

        // Obter maestrias dos campeões (com cache)
        const championMasteriesUrl = `https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`;
        const masteriesCacheKey = getCacheKey('champion-masteries', { puuid });

        const championMasteriesResponse = await fetchWithCache(championMasteriesUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        }, masteriesCacheKey);

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
        // Cache key para toda a análise de lane
        const laneAnalysisCacheKey = getCacheKey('summoner-lane', { summonerName, tagline });
        
        // Verificar se já temos análise completa no cache
        if (cache.has(laneAnalysisCacheKey)) {
            const { data, timestamp } = cache.get(laneAnalysisCacheKey);
            if (Date.now() - timestamp < CACHE_DURATION) {
                console.log('Retornando análise de lane do cache');
                return res.json(data);
            }
        }

        // Primeiro, obter o PUUID (com cache)
        const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagline}`;
        const puuidCacheKey = getCacheKey('puuid', { summonerName, tagline });

        const accountResponse = await fetchWithCache(accountUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        }, puuidCacheKey);

        if (!accountResponse.ok) {
            const errorData = await accountResponse.json();
            return res.status(accountResponse.status).json({ error: errorData });
        }

        const accountData = await accountResponse.json();
        const puuid = accountData.puuid;

        // Obter lista de partidas (REDUZIDO para apenas 15 partidas para economizar)
        const matchListUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=15&type=ranked`;
        const matchListCacheKey = getCacheKey('match-list', { puuid, count: 15 });

        const matchListResponse = await fetchWithCache(matchListUrl, {
            headers: { 'X-Riot-Token': riotApiKey },
        }, matchListCacheKey);

        if (!matchListResponse.ok) {
            const errorData = await matchListResponse.json();
            return res.status(matchListResponse.status).json({ error: errorData });
        }

        const matchIds = await matchListResponse.json();

        if (matchIds.length === 0) {
            const result = {
                mainRole: 'Sem dados suficientes',
                roleStatistics: {},
                totalMatches: 0
            };
            // Cache mesmo quando não há dados
            cache.set(laneAnalysisCacheKey, { data: result, timestamp: Date.now() });
            return res.json(result);
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

        // OTIMIZAÇÃO: Analisar apenas as 8 partidas mais recentes para uma amostra rápida
        const matchesToAnalyze = matchIds.slice(0, 8);

        for (const matchId of matchesToAnalyze) {
            try {
                const matchDetailUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`;
                const matchCacheKey = getCacheKey('match-detail', { matchId });

                const matchDetailResponse = await fetchWithCache(matchDetailUrl, {
                    headers: { 'X-Riot-Token': riotApiKey },
                }, matchCacheKey);

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

                // REDUZIDO: delay menor (50ms) e menos partidas = menos tempo total
                await new Promise(resolve => setTimeout(resolve, 50));

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

        const result = {
            mainRole,
            roleStatistics,
            totalMatches: processedMatches,
            analysisNote: `Análise rápida baseada nas últimas ${processedMatches} partidas ranked (otimizada para economia de API)`,
            cacheInfo: 'Dados válidos por 10 minutos'
        };

        // Cachear o resultado completo da análise
        cache.set(laneAnalysisCacheKey, { data: result, timestamp: Date.now() });

        res.json(result);

    } catch (error) {
        console.error('Erro ao buscar dados da Riot API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Riot API', details: error.message });
    }
};

// Função para limpar cache (útil para desenvolvimento ou problemas)
const clearCache = (req, res) => {
    const cacheSize = cache.size;
    cache.clear();
    console.log(`Cache limpo. ${cacheSize} entradas removidas.`);
    res.json({ 
        message: 'Cache limpo com sucesso', 
        entriesRemoved: cacheSize,
        timestamp: new Date().toISOString()
    });
};

// Função para verificar estatísticas do cache
const getCacheStats = (req, res) => {
    const stats = {
        totalEntries: cache.size,
        cacheEntries: [],
        cacheDuration: `${CACHE_DURATION / 1000 / 60} minutos`
    };

    for (const [key, value] of cache.entries()) {
        const age = Date.now() - value.timestamp;
        const remaining = Math.max(0, CACHE_DURATION - age);
        stats.cacheEntries.push({
            key,
            ageMinutes: Math.round(age / 1000 / 60),
            remainingMinutes: Math.round(remaining / 1000 / 60),
            expired: remaining <= 0
        });
    }

    res.json(stats);
};

module.exports = {
    getPuuid,
    getElo,
    getChampionMasteries,
    getSummonerLane,
    clearCache,
    getCacheStats
};
