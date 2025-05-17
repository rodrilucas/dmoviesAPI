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

const router = express.Router();
const moviesController = new MoviesController();

router.get(
  "/movies/suggestions",
  validateQuery(suggestionSchema),
  catchAsync(moviesController.getSuggestionsByKeyword.bind(moviesController))
);

router.get(
  "/movies",
  validateQuery(paginationSchema),
  catchAsync(moviesController.getMoviesPaginated.bind(moviesController))
);

router.post(
  "/movies",
  validateBody(filtersSchema),
  catchAsync(moviesController.getMoviesByFilterPaginated.bind(moviesController))
);

router.get(
  "/movies/search",
  validateQuery(searchQuerySchema),
  catchAsync(moviesController.searchMovies.bind(moviesController))
);

router.post(
  "/movies/update",
  validateBody(updatePopularMoviesSchema),
  catchAsync(moviesController.updatePopularMovies.bind(moviesController))
);

router.get(
  "/movies/:id",
  validateParams(movieIdParamSchema),
  catchAsync(moviesController.getMovieById.bind(moviesController))
);

export { router };
