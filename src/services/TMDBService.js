import dotenv from "dotenv";
import { AppError } from "../errors/AppError.js";
dotenv.config();

export class TheMovieDBService {
  #TMDB_API_BASE_URL;
  #TMDB_TOKEN;

  constructor() {
    this.#TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
    this.#TMDB_TOKEN = process.env.TMDB_TOKEN;
  }

  async fetchFromTMDB(endpoint, options = {}) {
    const url = `${this.#TMDB_API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.#TMDB_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AppError(
        `Erro ao acessar TMDB (${response.status}): ${
          data.status_message || response.statusText
        }`,
        response.status
      );
    }

    return data;
  }

  async fetchPopularMovies(totalPages = 1) {
    const movies = [];
    for (let page = 1; page <= totalPages; page++) {
      const data = await this.fetchFromTMDB(
        `/movie/popular?language=pt-BR&page=${page}`
      );
      movies.push(...data.results);
    }
    return movies;
  }

  async fetchMovieByQuery(query, page = 1) {
    const data = await this.fetchFromTMDB(
      `/search/movie?query=${encodeURIComponent(
        query
      )}&language=pt-BR&page=${page}`
    );
    return {
      movies: data.results || [],
      total_pages: data.total_pages,
      total_results: data.total_results,
    };
  }

  async fetchMovieById(id) {
    try {
      return await this.fetchFromTMDB(`/movie/${id}?language=pt-BR`);
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }
}
