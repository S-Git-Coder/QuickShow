import axios from 'axios';
import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import { inngest } from '../inngest/index.js';
import { ensureDb } from '../configs/db.js';

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try {
        await ensureDb();
        const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            params: { api_key: process.env.TMDB_API_KEY }
        });

        const movies = data.results;
        res.json({ success: true, movies: movies })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to add a new show to the database
export const addShow = async (req, res) => {
    try {
        await ensureDb();
        const { movieId, showsInput, showPrice, trailerUrl } = req.body

        // Debug: log incoming payload (omit potentially large arrays)
        console.log('[addShow] incoming movieId:', movieId, 'trailerUrl:', trailerUrl);

        let movie = await Movie.findById(movieId)

        if (!movie) {
            // Fetch movie details and credits from TMDB API
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    params: { api_key: process.env.TMDB_API_KEY }
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    params: { api_key: process.env.TMDB_API_KEY }
                })
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            // Normalize trailer URL if provided
            const normalizeYouTube = (input) => {
                if (!input) return undefined;
                const str = String(input).trim();
                // Extract video id from various formats
                const ytRegex = /(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/i;
                const match = str.match(ytRegex);
                const id = match ? match[1] : (/^[A-Za-z0-9_-]{6,}$/i.test(str) ? str : null);
                if (!id) return str.startsWith('http') ? str : undefined;
                return `https://www.youtube.com/watch?v=${id}`;
            };
            const normalizedTrailerUrl = normalizeYouTube(trailerUrl) || (trailerUrl ? String(trailerUrl).trim() : undefined);
            console.log('[addShow] creating NEW movie. Normalized trailer =', normalizedTrailerUrl);

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
                trailerUrl: normalizedTrailerUrl,
            }

            // Add movie to the database
            movie = await Movie.create(movieDetails);
        } else if (trailerUrl) {
            const normalizeYouTube = (input) => {
                if (!input) return undefined;
                const str = String(input).trim();
                const ytRegex = /(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/i;
                const match = str.match(ytRegex);
                const id = match ? match[1] : (/^[A-Za-z0-9_-]{6,}$/i.test(str) ? str : null);
                if (!id) return str.startsWith('http') ? str : undefined;
                return `https://www.youtube.com/watch?v=${id}`;
            };
            const normalized = normalizeYouTube(trailerUrl) || String(trailerUrl).trim();
            console.log('[addShow] existing movie found. Current stored trailer =', movie.trailerUrl, 'Incoming normalized =', normalized);
            if (normalized && normalized !== movie.trailerUrl) {
                movie.trailerUrl = normalized;
                await movie.save();
                console.log('[addShow] movie trailerUrl UPDATED to', movie.trailerUrl);
            } else {
                console.log('[addShow] movie trailerUrl unchanged');
            }
        }

        // Helper: interpret provided date & time as Asia/Kolkata local time, then store as UTC Date
        const toUTCFromIST = (dateStr, timeStr) => {
            // Build a UTC date from IST components by subtracting +05:30 offset (330 minutes)
            const [y, m, d] = dateStr.split('-').map(Number);
            const [hh, mm] = timeStr.split(':').map(Number);
            const utc = new Date(Date.UTC(y, m - 1, d, hh, mm));
            // IST = UTC + 5:30, so to get UTC instant for the local IST time, subtract 330 minutes
            utc.setUTCMinutes(utc.getUTCMinutes() - 330);
            return utc;
        };

        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.time.forEach((time) => {
                const when = toUTCFromIST(showDate, time);
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: when,
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });

        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }

        // Trigger Inngest event
        await inngest.send({
            name: "app/show.added",
            data: { movieTitle: movie.title }
        })

        // After all operations, confirm what trailerUrl is persisted now
        const verifyMovie = await Movie.findById(movieId).lean();
        console.log('[addShow] final persisted trailerUrl =', verifyMovie?.trailerUrl);

        res.json({ success: true, message: "Show added successfully." });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

// API to get all shows from the database
export const getShows = async (req, res) => {
    try {
        await ensureDb();
        console.log('[getShows] Starting query execution');
        
        // Use a more efficient approach - first get distinct movie IDs with future shows
        // This reduces the amount of data we need to process
        const startTime = Date.now();
        const distinctMovieIds = await Show.distinct('movie', { 
            showDateTime: { $gte: new Date() } 
        }).exec();
        console.log(`[getShows] Found ${distinctMovieIds.length} distinct movies with future shows in ${Date.now() - startTime}ms`);
        
        if (distinctMovieIds.length === 0) {
            return res.json({ success: true, shows: [] });
        }
        
        // Then fetch just those movies in a separate query
        const movieQueryStart = Date.now();
        const movies = await Movie.find({ 
            _id: { $in: distinctMovieIds } 
        }).lean().exec();
        console.log(`[getShows] Fetched ${movies.length} movies in ${Date.now() - movieQueryStart}ms`);

        // Enhanced debug logging
        const sample = movies.slice(0, 3).map(m => ({ id: m._id, title: m.title, trailerUrl: m.trailerUrl }));
        console.log('[getShows] sample (first 3):', sample);
        const missing = movies.filter(m => !m.trailerUrl).map(m => m._id);
        if (missing.length) console.log('[getShows] movies WITHOUT trailerUrl:', missing);
        
        // No longer adding sample trailer URLs to movies without trailers
        // This ensures only actual trailer URLs entered in the admin panel are used
        if (movies.length > 0) {
            const moviesWithoutTrailers = movies.filter(m => !m.trailerUrl);
            if (moviesWithoutTrailers.length > 0) {
                console.log(`[getShows] Found ${moviesWithoutTrailers.length} movies without trailers`);
            }
        }
        
        console.log('[getShows] Number of movies with trailers:', movies.filter(m => m.trailerUrl).length);

        res.json({ success: true, shows: movies });
    } catch (error) {
        console.error('[getShows] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch shows. Please try again later.',
            error: error.message 
        });
    }
}

// Manually set / update a movie trailerUrl
export const setTrailer = async (req, res) => {
    try {
        await ensureDb();
        const { movieId, trailerUrl } = req.body;
        if (!movieId || !trailerUrl) return res.json({ success: false, message: 'movieId and trailerUrl required' });
        const movie = await Movie.findById(movieId);
        if (!movie) return res.json({ success: false, message: 'Movie not found' });
        const normalizeYouTube = (input) => {
            if (!input) return undefined;
            const str = String(input).trim();
            const ytRegex = /(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/i;
            const match = str.match(ytRegex);
            const id = match ? match[1] : (/^[A-Za-z0-9_-]{6,}$/i.test(str) ? str : null);
            if (!id) return str.startsWith('http') ? str : undefined;
            return `https://www.youtube.com/watch?v=${id}`;
        };
        const normalized = normalizeYouTube(trailerUrl) || String(trailerUrl).trim();
        movie.trailerUrl = normalized;
        await movie.save();
        console.log('[setTrailer] movie', movieId, 'updated trailerUrl =', movie.trailerUrl);
        res.json({ success: true, trailerUrl: movie.trailerUrl });
    } catch (e) {
        console.error('[setTrailer] error:', e.message);
        res.json({ success: false, message: e.message });
    }
}

// API to get a single show from the database
export const getShow = async (req, res) => {
    try {
        await ensureDb();
        const { movieId } = req.params;
        const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } });
        const movie = await Movie.findById(movieId);

        if (!movie) {
            console.error("Show is not defined for movieId:", movieId);
            return res.json({ success: false, message: "Show is not defined" });
        }

        const dateTime = {};
        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if (!dateTime[date]) {
                dateTime[date] = []
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id })
        })

        res.json({ success: true, movie, dateTime })
    } catch (error) {
        console.error("Error in getShow:", error);
        res.json({ success: false, message: error.message });
    }
}