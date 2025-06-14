import { AppError } from "../errors/AppError.js";
import { MoviesRepository } from "../repositories/moviesRepository.js";
import { normalizeQuery } from "../utils/normalizeQuery.js";

export class MoviesService {
  #repository = new MoviesRepository();

  async saveOrUpdateMovies(movies) {
    if (!Array.isArray(movies)) {
      throw new AppError("A lista de filmes deve ser um array.", 400);
    }

    try {
      await Promise.all(movies.map((movie) => this.saveOrUpdateMovie(movie)));
    } catch (err) {
      throw new AppError("Erro interno do servidor", 500);
    }
  }

  async saveOrUpdateMovie(movie) {
    if (!movie || typeof movie !== "object") {
      throw new AppError("Movie deve ser um objeto.", 400);
    }

    try {
      const releaseDate = this.#normalizeReleaseDate(movie.release_date);
      await this.#repository.upsert({
        ...movie,
        release_date: releaseDate,
      });
    } catch (err) {
      throw new AppError("Erro interno do servidor", 500);
    }
  }

  async getMoviesPaginated(page, limit, sortBy, sortOrder) {
    try {
      const movies = await this.#repository.findAllPaginated(
        page,
        limit,
        sortBy,
        sortOrder
      );

      return {
        totalPages: Math.ceil(movies.length / limit),
        totalMovies: movies.length,
        movies,
      };
    } catch (error) {
      throw new AppError("Erro interno do servidor", 500);
    }
  }

  async getMovieById(id) {
    try {
      const movie = await this.#repository.findById(id);
      if (!movie) throw new AppError("Filme não encontrado", 404);
      return movie;
    } catch (error) {
      throw new AppError("Erro interno do servidor", 500);
    }
  }

  async getSuggestionsByKeyword(keyword, limit = 5) {
    try {
      return this.#repository.findSuggestions(keyword, limit);
    } catch (error) {
      throw new AppError("Erro interno do servidor", 500);
    }
  }

  async getMoviesByIds(movieIds, sortBy, sortOrder) {
    try {
      const movies = this.#repository.findByIds(movieIds, sortBy, sortOrder);
      return movies;
    } catch (error) {
      throw new AppError("Erro interno do servidor", 500);
    }
  }

  async getMoviesByFilterPaginated(filters) {
    try {
      const movies = await this.#repository.findByFilterPaginated(filters);
      const totalMovies = movies.length;
      const totalPages = Math.ceil(totalMovies / filters.limit);

      return { totalPages, totalMovies, movies };
    } catch (err) {
      throw new AppError("Erro interno do servidor", 500);
    }
  }

  async getMoviePageData(query, page = 1) {
    try {
      const normalized = normalizeQuery(query);
      return this.#repository.getMoviePage(normalized, page);
    } catch (error) {
      throw new AppError("Erro interno do servidor", 500);
    }
  }

  async saveMoviePage(query, { page, totalPages, totalResults, movieIds }) {
    const normalized = normalizeQuery(query);
    const uniqueIds = [...new Set(movieIds)].filter(Number.isInteger);

    if (!uniqueIds.length) return null;

    try {
      const existing = await this.#repository.getMoviePage(normalized, page);

      if (existing) return existing;

      await this.#repository.saveMoviePage({
        query,
        normalized_query: normalized,
        page_number: page,
        total_pages: totalPages,
        total_results: totalResults,
        movie_ids: uniqueIds,
      });

      return this.#repository.getMoviePage(normalized, page);
    } catch (error) {
      throw new AppError("Erro interno do servidor", 500);
    }
  }

  #normalizeReleaseDate(releaseDate) {
    if (
      !releaseDate ||
      typeof releaseDate !== "string" ||
      releaseDate.trim() === ""
    ) {
      return null;
    }

    const parsedDate = Date.parse(releaseDate);
    return isNaN(parsedDate)
      ? null
      : new Date(parsedDate).toISOString().split("T")[0];
  }

  #applyKeywordFilter(query, keyword) {
    query.where((qb) => {
      qb.where("title", "ilike", `%${keyword}%`).orWhere(
        "original_title",
        "ilike",
        `%${keyword}%`
      );
    });
  }
}
