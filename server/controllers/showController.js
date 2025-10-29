import axios from 'axios';
import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import { inngest } from '../inngest/index.js';
import mongoose from 'mongoose';

// API to get unique cities from shows (for movie details page)
export const getUniqueCities = async (req, res) => {
    try {
        // Find all shows and get unique cities
        const cities = await Show.distinct('city');

        // Filter out null or undefined values and sort alphabetically
        const validCities = cities.filter(city => city).sort();

        res.json({ success: true, cities: validCities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get cities with running shows for a specific movie
export const getCitiesForMovie = async (req, res) => {
    try {
        const { movieId } = req.params;

        if (!movieId) {
            return res.status(400).json({
                success: false,
                message: "Movie ID is required"
            });
        }

        // Find all shows for the specified movie and get unique cities
        const cities = await Show.distinct('city', { movie: movieId });

        // Filter out null or undefined values and sort alphabetically
        const validCities = cities.filter(city => city).sort();

        res.json({ success: true, cities: validCities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get all cities (for admin panel)
export const getAllCities = async (req, res) => {
    try {
        // Get cities from shows
        const showCities = await Show.distinct('city');

        // Combine with static list of cities to ensure all are available
        const staticCities = [
            "Mumbai", "Delhi", "Bangalore", "Hyderabad",
            "Chennai", "Ahmedabad", "Kolkata", "Pune"
        ];

        // Combine, filter out null/undefined, remove duplicates, and sort
        const allCities = [...new Set([...showCities, ...staticCities])]
            .filter(city => city)
            .sort();

        res.json({ success: true, cities: allCities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get unique theaters for a specific city
export const getUniqueTheaters = async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City parameter is required"
            });
        }

        // Find all theaters for the specified city
        const theaters = await Show.distinct('theater', { city });

        // Filter out null or undefined values and sort alphabetically
        const validTheaters = theaters.filter(theater => theater).sort();

        res.json({ success: true, theaters: validTheaters });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get available dates for a movie in a specific city
export const getAvailableDates = async (req, res) => {
    try {
        const { movieId, city } = req.query;

        if (!movieId || !city) {
            return res.status(400).json({
                success: false,
                message: "Both movieId and city parameters are required"
            });
        }

        // Find all shows for the specified movie and city with future dates
        const shows = await Show.find({
            movie: movieId,
            city,
            showDateTime: { $gte: new Date() }
        });

        // Extract unique dates in YYYY-MM-DD format
        const uniqueDates = [...new Set(
            shows.map(show => show.showDateTime.toISOString().split('T')[0])
        )].sort();

        res.json({ success: true, dates: uniqueDates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get theaters for a specific movie, city, and date
export const getTheatersForDate = async (req, res) => {
    try {
        const { movieId, city, date } = req.query;

        if (!movieId || !city || !date) {
            return res.status(400).json({
                success: false,
                message: "movieId, city, and date parameters are required"
            });
        }

        // Create date range for the specified date (00:00:00 to 23:59:59)
        const startDate = new Date(`${date}T00:00:00.000Z`);
        const endDate = new Date(`${date}T23:59:59.999Z`);

        // Find all shows for the specified movie, city, and date range
        const shows = await Show.find({
            movie: movieId,
            city,
            showDateTime: { $gte: startDate, $lte: endDate }
        });

        // Extract unique theaters
        const uniqueTheaters = [...new Set(
            shows.map(show => show.theater)
        )].filter(theater => theater).sort();

        res.json({ success: true, theaters: uniqueTheaters });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get theater slots (screens and showtimes) for a specific movie, city, and date
export const getTheaterSlots = async (req, res) => {
    try {
        const { movieId, city, date } = req.query;

        if (!movieId || !city || !date) {
            return res.status(400).json({
                success: false,
                message: "movieId, city, and date parameters are required"
            });
        }

        // Create date range for the specified date (00:00:00 to 23:59:59)
        const startDate = new Date(`${date}T00:00:00.000Z`);
        const endDate = new Date(`${date}T23:59:59.999Z`);

        // Find all shows for the specified movie, city, and date range
        const shows = await Show.find({
            movie: movieId,
            city,
            showDateTime: { $gte: startDate, $lte: endDate }
        });

        // Group shows by theater
        const theaterMap = {};

        shows.forEach(show => {
            const theater = show.theater;
            if (!theater) return;

            if (!theaterMap[theater]) {
                theaterMap[theater] = {
                    // screens: new Set(),
                    // showtimes: new Set()
                    slots: []
                };
            }
            theaterMap[theater].slots.push({
                showId: show._id,
                screen: show.screen,
                time: show.showDateTime
            });
        });

        //     // Add screen to the set if it exists
        //     if (show.screen) {
        //         theaterMap[theater].screens.add(show.screen);
        //     }

        //     // Format showtime to 12-hour format (e.g., "10:00 AM")
        //     const showDateTime = new Date(show.showDateTime);
        //     const hours = showDateTime.getHours();
        //     const minutes = showDateTime.getMinutes();
        //     const ampm = hours >= 12 ? 'PM' : 'AM';
        //     const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        //     const formattedMinutes = minutes.toString().padStart(2, '0');
        //     const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

        //     theaterMap[theater].showtimes.add(formattedTime);
        // });

        // Convert to the required response format
        // const theaterSlots = Object.keys(theaterMap).map(theater => {
        //     return {
        //         theater,
        //         screens: [...theaterMap[theater].screens].sort(),
        //         showtimes: [...theaterMap[theater].showtimes].sort((a, b) => {
        //             // Sort by AM/PM first, then by time
        //             const aIsAM = a.includes('AM');
        //             const bIsAM = b.includes('AM');

        //             if (aIsAM && !bIsAM) return -1;
        //             if (!aIsAM && bIsAM) return 1;

        //             // Both are AM or both are PM, sort by time
        //             const aTime = a.replace(' AM', '').replace(' PM', '');
        //             const bTime = b.replace(' AM', '').replace(' PM', '');

        //             return aTime.localeCompare(bTime);
        //         })
        //     };
        // });
        const theaterSlots = Object.keys(theaterMap).map(theater => ({
            theater,
            slots: theaterMap[theater].slots
        }));

        res.json({ success: true, theaterSlots });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try {
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
        const { movieId, showsInput, trailerUrl } = req.body

        // Validate required fields
        if (!movieId) {
            return res.status(400).json({
                success: false,
                message: "Movie ID is required"
            });
        }

        // Validate showsInput is an array
        if (!showsInput || !Array.isArray(showsInput) || showsInput.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Shows input must be a non-empty array"
            });
        }

        // Use showsInput directly as it's the current standard format
        const showsData = showsInput;

        console.log("Received shows:", showsData);

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
                trailerUrl: trailerUrl || "",
            }

            // Add movie to the database
            movie = await Movie.create(movieDetails);
        } else if (trailerUrl) {
            // Update existing movie with trailer URL if provided
            movie.trailerUrl = trailerUrl;
            await movie.save();
        }

        const showsToCreate = [];

        //  Debug Logs — to inspect payload
        console.log("------ SHOWS DEBUG LOG START ------");
        console.log("Full req.body received:", JSON.stringify(req.body, null, 2));
        console.log("movieId:", movieId);
        console.log("showsInput:", Array.isArray(showsInput) ? `Array(${showsInput.length})` : showsInput);
        console.log("showsData:", Array.isArray(showsData) ? `Array(${showsData.length})` : showsData);
        console.log("------ SHOWS DEBUG LOG END ------\n");

        // Safe iteration with proper type checking
        if (Array.isArray(showsData)) {
            showsData.forEach(show => {
                // Validate show object has required properties
                if (!show || typeof show !== 'object') {
                    console.log('Warning: Invalid show object. Skipping.');
                    return;
                }

                if (show.dateTime && typeof show.dateTime === 'string') {
                    const showDateTime = new Date(show.dateTime);

                    // Create show object with city, theater, and screen information
                    showsToCreate.push({
                        movie: movie._id,
                        showDateTime: showDateTime,
                        showPrice: show.price || 0,
                        city: show.city || null,
                        theater: show.theaterName || null,  // Use theaterName instead of theater ID
                        screen: show.screenName || null     // Use screenName instead of screen ID
                    });
                } else if (show.date) {
                    const showDate = show.date;

                    // Defensive check to ensure show.time is an array
                    if (!show.time || !Array.isArray(show.time)) {
                        console.log(`Warning: show.time is not an array for date ${showDate}. Skipping this show.`);
                        return;
                    }

                    show.time.forEach((time) => {
                        if (!time) {
                            console.log(`Warning: Invalid time value for date ${showDate}. Skipping.`);
                            return;
                        }

                        const dateTimeString = `${showDate}T${time}`;
                        // Using human-readable names for city, theater and screen
                        showsToCreate.push({
                            movie: movieId,
                            showDateTime: new Date(dateTimeString),
                            occupiedSeats: {},
                            city: show.city || null,
                            theater: show.theater || null,
                            screen: show.screen || null
                        });
                    });
                } else {
                    console.warn("Invalid show data detected:", show);
                }
            });
        } else {
            console.log('Warning: showsData is not an array. Cannot process shows.');
        }


        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);

            // Trigger Inngest event
            await inngest.send({
                name: "app/show.added",
                data: { movieTitle: movie.title }
            });

            res.json({ success: true, message: "Show added successfully." });
        } else {
            res.status(400).json({
                success: false,
                message: "No valid shows were provided to create"
            });
        }

    } catch (error) {
        console.error("Error in addShow:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get all shows from the database
export const getShows = async (req, res) => {
    try {

        const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 });

        // filter unique shows
        const uniqueShows = new Set(shows.map(show => show.movie))

        res.json({ success: true, shows: Array.from(uniqueShows) })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get a single show from the database
export const getShow = async (req, res) => {
    try {
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
            dateTime[date].push({ 
                time: show.showDateTime, 
                showId: show._id,
                screen: show.screen,
                theater: show.theater
                })
        })

        res.json({ success: true, movie, dateTime })
    } catch (error) {
        console.error("Error in getShow:", error);
        res.json({ success: false, message: error.message });
    }
}

// API to get trailer URLs for movies with active shows
export const getActiveTrailers = async (req, res) => {
    try {
        // Find all shows with future dates
        const activeShows = await Show.find({
            showDateTime: { $gte: new Date() }
        }).distinct('movie');

        // Find all movies with active shows that have trailer URLs
        const moviesWithTrailers = await Movie.find({
            _id: { $in: activeShows },
            trailerUrl: { $exists: true, $ne: null, $ne: "" }
        }).select('title trailerUrl poster_path');

        if (moviesWithTrailers.length === 0) {
            return res.json({ success: true, trailers: [], hasTrailers: false });
        }

        // Format the response
        const trailers = moviesWithTrailers.map(movie => ({
            title: movie.title,
            videoUrl: movie.trailerUrl,
            image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        }));

        res.json({ success: true, trailers, hasTrailers: true });
    } catch (error) {
        console.error("Error in getActiveTrailers:", error);
        res.json({ success: false, message: error.message });
    }
}