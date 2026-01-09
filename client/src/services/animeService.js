import axios from "axios";
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configure axios with timeout to prevent infinite hangs
const jikanAxios = axios.create({
  timeout: 10000, // 10 second timeout
});

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let jikanLock = Promise.resolve();

const jikanGet = async (url, retries = 3, backoff = 1000) => {
  // 1. Check Cache
  const cached = cache.get(url);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    // console.log(`[Jikan Cache] Hit: ${url}`);
    return cached.data;
  }

  // 2. Sequence all Jikan requests globally to prevent collisions between components
  return jikanLock = jikanLock.then(async () => {
    await delay(350); // Slightly reduced delay

    const performFetch = async (currentRetries, currentBackoff) => {
      try {
        console.log(`[Jikan API] Fetching: ${url}`);
        const res = await jikanAxios.get(url);

        // Cache the successful response
        cache.set(url, {
          data: res.data,
          timestamp: Date.now()
        });

        console.log(`[Jikan API] Success: ${url}`);
        return res.data;
      } catch (err) {
        // Rate limiting - retry with backoff
        if (err.response?.status === 429 && currentRetries > 0) {
          console.warn(`[Jikan API] Rate limited (429). Retrying in ${currentBackoff}ms... (${currentRetries} retries left)`);
          await delay(currentBackoff);
          return performFetch(currentRetries - 1, Math.min(currentBackoff * 1.5, 5000)); // Cap max backoff at 5s
        }

        // Timeout or other error - log and throw
        if (err.code === 'ECONNABORTED') {
          console.error(`[Jikan API] Timeout after 10s: ${url}`);
        } else {
          console.error(`[Jikan API] Error: ${url}`, err.message);
        }
        throw err;
      }
    };

    return performFetch(retries, backoff);
  });
};

export const searchAnime = async (query, options = {}) => {
  const isRelevance = !options.order_by || options.order_by === 'relevance';

  const params = new URLSearchParams({
    limit: 25,
    ...(query && { q: query }),
    ...(options.genres && { genres: options.genres }),
    ...(!isRelevance && { order_by: options.order_by }),
    ...(!isRelevance && options.sort && { sort: options.sort }),
    ...(options.status && { status: options.status }),
    ...(options.min_score && { min_score: options.min_score }),
    ...(options.rating && { rating: options.rating }),
  });

  const data = await jikanGet(`https://api.jikan.moe/v4/anime?${params.toString()}`);
  return data.data || [];
};

export const getTrendingAnime = async (limit = 24) => {
  const data = await jikanGet(`https://api.jikan.moe/v4/top/anime?filter=airing&limit=${limit}`);
  return data.data;
};

export const getAiringAnime = async (limit = 24) => {
  const data = await jikanGet(`https://api.jikan.moe/v4/top/anime?filter=airing&limit=${limit}`);
  return data.data;
};

export const getAnimeSchedule = async (day) => {
  const url = day
    ? `https://api.jikan.moe/v4/schedules?filter=${day}`
    : "https://api.jikan.moe/v4/schedules";
  const data = await jikanGet(url);
  return data.data;
};

export const getUpcomingAnime = async (limit = 24) => {
  const data = await jikanGet(`https://api.jikan.moe/v4/top/anime?filter=upcoming&limit=${limit}`);
  return data.data;
};

export const getAnimeRelations = async (id) => {
  const data = await jikanGet(`https://api.jikan.moe/v4/anime/${id}/relations`);
  return data.data;
};

export const getAnimeById = async (id) => {
  const data = await jikanGet(`https://api.jikan.moe/v4/anime/${id}`);
  return data.data;
};

export const getFullAnimeById = async (id) => {
  const data = await jikanGet(`https://api.jikan.moe/v4/anime/${id}/full`);
  return data.data;
};

export const getAnimeCharacters = async (id) => {
  const data = await jikanGet(`https://api.jikan.moe/v4/anime/${id}/characters`);
  return data.data;
};

export const getAnimeStaff = async (id) => {
  const data = await jikanGet(`https://api.jikan.moe/v4/anime/${id}/staff`);
  return data.data;
};

export const getAnimeRecommendations = async (id) => {
  const data = await jikanGet(`https://api.jikan.moe/v4/anime/${id}/recommendations`);
  return data.data;
};

export const getAnimeGenres = async () => {
  const data = await jikanGet("https://api.jikan.moe/v4/genres/anime");
  return data.data;
};

export const getAnimeByGenre = async (genreId, limit = 10) => {
  const data = await jikanGet(
    `https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=score&sort=desc&limit=${limit}`
  );
  return data.data;
};

export const getAIRecommendations = async (watchlist) => {
  if (!watchlist || watchlist.length === 0) return [];

  // 1. Analyze user taste
  const genreCounts = {};
  let hasGenres = false;

  watchlist.forEach(anime => {
    if (anime.genres && Array.isArray(anime.genres) && anime.genres.length > 0) {
      hasGenres = true;
      anime.genres.forEach(g => {
        const name = typeof g === 'string' ? g : g.name;
        if (name) {
          genreCounts[name] = (genreCounts[name] || 0) + 1;
        }
      });
    }
  });

  let sortedGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name);

  // Fallback if no genre data found in older watchlist items
  if (!hasGenres || sortedGenres.length === 0) {
    sortedGenres = ["Action", "Adventure", "Fantasy", "Comedy"]; // High probability fallbacks
  }

  try {
    const GENRE_MAP = {
      'action': 1, 'adventure': 2, 'comedy': 4, 'drama': 8, 'fantasy': 10,
      'romance': 22, 'sci-fi': 24, 'slice of life': 36, 'sports': 30,
      'supernatural': 37, 'suspense': 41, 'horror': 14, 'mystery': 7
    };

    let topGenreIds = sortedGenres
      .map(name => GENRE_MAP[name.toLowerCase()])
      .filter(id => id);

    if (topGenreIds.length === 0) {
      await delay(500); // Respect Jikan rate limit
      try {
        const allGenres = await getAnimeGenres();
        topGenreIds = sortedGenres
          .map(name => allGenres.find(g => g.name.toLowerCase() === name.toLowerCase())?.mal_id)
          .filter(id => id);
      } catch (e) {
        console.error("Genre API failed", e);
      }
    }

    if (topGenreIds.length === 0) return [];

    // 3. Fetch candidates with small delay between requests
    const candidates = [];
    const idsToFetch = topGenreIds.slice(0, 3); // Get top 3 genres for more variety

    for (let i = 0; i < idsToFetch.length; i++) {
      if (i > 0) await delay(500); // 500ms is enough between requests to stay safe
      const genreData = await getAnimeByGenre(idsToFetch[i], 16);
      candidates.push(...genreData);
    }

    // 4. Final Polish: Unique entries and filter out existing watchlist items
    const watchlistMalIds = new Set(watchlist.map(a => a.mal_id));
    const seen = new Set();

    // Shuffle candidates to ensure variety on every refresh
    const shuffled = candidates.sort(() => Math.random() - 0.5);

    const finalRecommendations = shuffled.filter(anime => {
      if (watchlistMalIds.has(anime.mal_id)) return false;
      if (seen.has(anime.mal_id)) return false;
      seen.add(anime.mal_id);
      return true;
    });

    return finalRecommendations.slice(0, 8);
  } catch (err) {
    console.error("AI Recommendation error:", err);
    return [];
  }
};
