import express from "express";
import { addShow, getAllCities, getActiveTrailers, getAvailableDates, getCitiesForMovie, getNowPlayingMovies, getShow, getShows, getTheaterSlots, getTheatersForDate, getUniqueCities, getUniqueTheaters } from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get('/now-playing', protectAdmin, getNowPlayingMovies)
showRouter.post('/add', protectAdmin, addShow)
showRouter.get('/all',getShows)
showRouter.get('/active-trailers', getActiveTrailers)
showRouter.get('/cities', getUniqueCities)
showRouter.get('/all-cities', getAllCities)
showRouter.get('/cities/:movieId', getCitiesForMovie)
showRouter.get('/theaters', getUniqueTheaters)
showRouter.get('/dates', getAvailableDates)
showRouter.get('/theaters-for-date', getTheatersForDate)
showRouter.get('/theater-slots', getTheaterSlots)
showRouter.get('/:movieId',getShow)

export default showRouter;