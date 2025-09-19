import express from "express";
import { addShow, getNowPlayingMovies, getShow, getShows, setTrailer } from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get('/now-playing', protectAdmin, getNowPlayingMovies)
showRouter.post('/add', protectAdmin, addShow)
showRouter.post('/set-trailer', protectAdmin, setTrailer)
showRouter.get('/all', getShows)
showRouter.get('/:movieId', getShow)

export default showRouter;