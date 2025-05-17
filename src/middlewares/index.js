export { catchAsync } from "../middlewares/catchAsync.js";
export { checkApiKey } from "../middlewares/checkApiKey.js";
export { errorHandler } from "./errorHandler.js";
export {
  validateParams,
  validateBody,
  validateQuery,
} from "../middlewares/validateSchema.js";
export {
  paginationSchema,
  updatePopularMoviesSchema,
  movieIdParamSchema,
  searchQuerySchema,
  suggestionSchema,
  filtersSchema,
} from "../schemas/querySchemas.js";
