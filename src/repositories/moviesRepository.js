// src/repositories/MoviesRepository.ts
import { db } from "../db/knex.js";

export class MoviesRepository {
  async upsert(movie) {
    return db("movies").insert(movie).onConflict("id").merge();
  }

  async findAllPaginated(page = 1, limit = 20, sortBy, sortOrder) {
    const offset = (page - 1) * limit;
    let query = db("movies").limit(limit).offset(offset);

    if (sortBy && sortOrder) {
      query.whereNotNull(sortBy).orderBy(sortBy, sortOrder);
    }

    return query;
  }

  async findById(id) {
    return db("movies").where({ id }).first();
  }

  async findByFilterPaginated(filters) {
    let query = db("movies");

    const conditions = [
      filters.startYear && ["release_date", ">=", filters.startYear],
      filters.endYear && ["release_date", "<=", filters.endYear],
      filters.language && ["original_language", "=", filters.language],
      filters.rating && ["vote_average", ">=", filters.rating],
      filters.avaliation && ["vote_count", ">=", filters.avaliation],
      filters.includeAdult === false && ["adult", false],
    ].filter(Boolean);

    for (const [field, op, value] of conditions) {
      query.where(field, op, value);
    }

    if (filters.keyword) {
      query.where((qb) => {
        qb.where("title", "ilike", `%${filters.keyword}%`).orWhere(
          "original_title",
          "ilike",
          `%${filters.keyword}%`
        );
      });
    }

    if (filters.genres?.length) {
      query.whereRaw(`genre_ids && ARRAY[${filters.genres.join(",")}]::int[]`);
    }

    if (filters.sort?.by && filters.sort?.order) {
      query
        .whereNotNull(filters.sort.by)
        .orderBy(filters.sort.by, filters.sort.order);
    }

    const offset = (filters.page - 1) * filters.limit;
    query.limit(filters.limit).offset(offset);

    return query;
  }

  async findSuggestions(keyword, limit = 5) {
    return db("movies")
      .whereILike("title", `%${keyword}%`)
      .orWhereILike("original_title", `%${keyword}%`)
      .select("id", "title")
      .limit(limit);
  }

  async getMoviePage(normalizedQuery, page) {
    return db("movie_pages")
      .where("normalized_query", normalizedQuery)
      .andWhere("page_number", page)
      .first();
  }

  async saveMoviePage(pageData) {
    return db("movie_pages").insert(pageData);
  }

  async findByIds(movieIds, sortBy, sortOrder) {
    const query = db("movies").whereIn("id", movieIds);

    if (sortBy && sortOrder) {
      query.orderBy(sortBy, sortOrder);
    }

    return query;
  }
}