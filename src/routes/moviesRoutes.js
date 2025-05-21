import express from "express";
import { MoviesController } from "../controllers/MoviesController.js";
import {
  catchAsync,
  validateParams,
  validateQuery,
  validateBody,
  paginationSchema,
  updatePopularMoviesSchema,
  movieIdParamSchema,
  searchQuerySchema,
  suggestionSchema,
  filtersSchema,
} from "../middlewares/index.js";
import { MoviesService } from "../services/MoviesService.js";
import { TheMovieDBService } from "../services/TMDBService.js";

const router = express.Router();
const moviesService = new MoviesService(); 
const tmdbService = new TheMovieDBService();
const moviesController = new MoviesController(moviesService, tmdbService);

router.get(
  "/movies/suggestions",
  validateQuery(suggestionSchema),
  catchAsync(moviesController.getSuggestionsByKeyword)
);

router.get(
  "/movies",
  validateQuery(paginationSchema),
  catchAsync(moviesController.getMoviesPaginated)
);

router.post(
  "/movies",
  validateBody(filtersSchema),
  catchAsync(moviesController.getMoviesByFilterPaginated)
);

router.get(
  "/movies/search",
  validateQuery(searchQuerySchema),
  catchAsync(moviesController.searchMovies)
);

router.post(
  "/movies/update",
  validateBody(updatePopularMoviesSchema),
  catchAsync(moviesController.updatePopularMovies)
);

router.get(
  "/movies/:id",
  validateParams(movieIdParamSchema),
  catchAsync(moviesController.getMovieById)
);

export { router };
