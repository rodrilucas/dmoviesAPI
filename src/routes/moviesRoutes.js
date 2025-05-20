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
