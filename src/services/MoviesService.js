import { db } from "../db/knex.js";
import { normalizeQuery } from "../utils/normalizeQuery.js";
import { AppError } from "../errors/AppError.js";

export class MoviesService {
  async saveOrUpdateMovies(movies) {
    if (!Array.isArray(movies)) {
      throw new AppError("A lista de filmes deve ser um array.", 400);
    }

    try {
      await Promise.all(movies.map((movie) => this.saveOrUpdateMovie(movie)));
    } catch {
      throw new AppError("Erro ao salvar ou atualizar filmes no banco de dados.", 500);
    }
  }

  async saveOrUpdateMovie(movie) {
    if (!movie || typeof movie !== "object") {
      throw new AppError("Movie deve ser um objeto.");
    }

    try {
      const releaseDate = this.#normalizeReleaseDate(movie.release_date);

      await db("movies")
        .insert({
          ...movie,
          release_date: releaseDate,
        })
        .onConflict("id")
        .merge();
    } catch {
      throw new AppError("Erro ao salvar ou atualizar filme no banco de dados.", 500);
    }
  }

  async getMoviesPaginated(page = 1, limit = 20, sortBy, sortOrder) {
    try {
      let query = db("movies");

      if (page && limit) {
        const offset = (page - 1) * limit;
        query = query.limit(limit).offset(offset);
      }

      if (sortBy && sortOrder) {
        query.whereNotNull(sortBy).orderBy(sortBy, sortOrder);
      }

      const movies = await query;
      let totalMovies = movies.length;
      let totalPages = limit ? Math.ceil(totalMovies / limit) : 1;

      return {
        totalPages,
        totalMovies,
        movies,
      };
    } catch {
      throw new AppError("Erro ao buscar filmes paginados no banco de dados.", 500);
    }
  }
  async getMoviesByFilterPaginated(filters) {
    try {
      let query = db("movies");

      const conditions = [
        filters.startYear && ["release_date", ">=", filters.startYear],
        filters.endYear && ["release_date", "<=", filters.endYear],
        filters.language && ["original_language", "=", filters.language],
        filters.rating && ["vote_average", ">=", filters.rating],
        filters.avaliation && ["vote_count", ">=", filters.avaliation],
        filters.includeAdult === false && ["adult", false],
      ].filter(Boolean);

      conditions.forEach(([field, op, value]) => {
        query.where(field, op, value);
      });

      if (filters.keyword) {
        this.#applyKeywordFilter(query, filters.keyword);
      }

      if (filters.genres?.length) {
        query.whereRaw(
          `genre_ids && ARRAY[${filters.genres.join(",")}]::int[]`
        );
      }

      if (filters.sort?.by && filters.sort?.order) {
        query
          .whereNotNull(filters.sort.by)
          .orderBy(filters.sort.by, filters.sort.order);
      }

      const offset = (filters.page - 1) * filters.limit;
      query.limit(filters.limit).offset(offset);

      const movies = await query;
      const totalMovies = movies.length;
      const totalPages = Math.ceil(totalMovies / filters.limit);

      return {
        totalPages,
        totalMovies,
        movies,
      };
    } catch (err) {
      throw new AppError("Erro ao filtrar filmes no banco de dados.", 500);
    }
  }

  async getSuggestionsByKeyword(keyword, limit = 5) {
    try {
      const query = db("movies")
        .whereILike("title", `%${keyword}%`)
        .orWhereILike("original_title", `%${keyword}%`)
        .select("id", "title")
        .limit(limit);
      const results = await query;
      return results;
    } catch (err) {
      throw new AppError("Erro ao buscar sugestões no banco de dados.", 500);
    }
  }

  async getMovieById(id) {
    try {
      return await db("movies").where({ id }).first();
    } catch {
      throw new AppError("Erro ao buscar filme por ID no banco de dados.", 500);
    }
  }

  async getMoviePageData(query, page = 1) {
    const normalizedQuery = normalizeQuery(query);
    try {
      return await db("movie_pages")
        .where("normalized_query", normalizedQuery)
        .andWhere("page_number", page)
        .first();
    } catch {
      throw new AppError("Erro ao buscar dados da página no banco de dados", 500);
    }
  }

  async saveMoviePage(query, { page, totalPages, totalResults, movieIds }) {
    const normalizedQuery = normalizeQuery(query);
    const uniqueIds = [...new Set(movieIds)].filter(Number.isInteger);

    if (uniqueIds.length === 0) return null;

    try {
      const existing = await db("movie_pages")
        .where("normalized_query", normalizedQuery)
        .andWhere("page_number", page)
        .first();

      if (existing) {
        return existing;
      }

      await db("movie_pages").insert({
        query,
        normalized_query: normalizedQuery,
        page_number: page,
        total_pages: totalPages,
        total_results: totalResults,
        movie_ids: uniqueIds,
      });

      return await db("movie_pages")
        .where("normalized_query", normalizedQuery)
        .andWhere("page_number", page)
        .first();
    } catch (err) {
      throw new AppError(
        "Erro ao salvar ou atualizar a página de filmes no banco de dados.",
        500
      );
    }
  }

  async getMoviesByIds(movieIds, sortBy, sortOrder) {
    try {
      const query = db("movies").whereIn("id", movieIds).select("*");

      if (sortBy && sortOrder) {
        query.orderBy(sortBy, sortOrder);
      }

      const movies = await query;

      return movies;
    } catch {
      throw new AppError("Erro ao buscar filmes por IDs no banco de dados.", 500);
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
