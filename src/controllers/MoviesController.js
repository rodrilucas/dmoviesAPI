export class MoviesController {
  #moviesService;
  #tmdbService;

  constructor(moviesService, tmdbService) {
    this.#moviesService = moviesService;
    this.#tmdbService = tmdbService;
  }
  
  updatePopularMovies = async (req, res) => {
    const { pages } = req.body;

    const movies = await this.#tmdbService.fetchPopularMovies(pages);

    if (movies.length === 0) {
      return res
        .status(400)
        .json({ message: "Nenhum filme encontrado na API." });
    }

    await Promise.all(
      movies.map((movie) => this.#moviesService.saveOrUpdateMovie(movie))
    );

    res.json({
      message: "Filmes atualizados com sucesso!",
      total: movies.length,
    });
  };

  getSuggestionsByKeyword = async (req, res) => {
    const { keyword, limit } = req.query;

    const movies = await this.#moviesService.getSuggestionsByKeyword(
      keyword,
      Number(limit) || 5
    );

    res.json({
      movies,
    });
  };

  getMoviesPaginated = async (req, res) => {
    const { page, limit, sort_by } = req.query;

    let sortBy = null;
    let sortOrder = null;

    if (sort_by) {
      [sortBy, sortOrder] = sort_by.join(".");
    }

    const data = await this.#moviesService.getMoviesPaginated(
      page,
      limit,
      sortBy,
      sortOrder
    );

    res.json(data);
  };

  getMoviesByFilterPaginated = async (req, res) => {
    const filters = req.body;

    const data = await this.#moviesService.getMoviesByFilterPaginated(filters);

    res.json(data);
  };

  searchMovies = async (req, res) => {
    const { query, page = 1, sort_by } = req.query;

    let sortBy = null;
    let sortOrder = null;

    if (sort_by) {
      [sortBy, sortOrder] = sort_by.join(".");
    }

    const pageData = await this.#moviesService.getMoviePageData(query, page);

    if (pageData) {
      const movies = await this.#moviesService.getMoviesByIds(
        pageData.movie_ids,
        page,
        sortBy,
        sortOrder
      );

      return res.json({
        movies,
        totalPages: pageData.total_pages,
        totalResults: pageData.total_results,
      });
    }

    const moviesFromAPI = await this.#tmdbService.fetchMovieByQuery(
      query,
      page
    );

    if (moviesFromAPI.length === 0) {
      return res.status(404).json({ message: "Nenhum filme encontrado." });
    }

    await this.#moviesService.saveOrUpdateMovies(moviesFromAPI.movies);

    const movieIds = moviesFromAPI.movies.map((movie) => movie.id);
    const totalPages = moviesFromAPI.total_pages || 1;
    const totalResults = moviesFromAPI.total_results || 0;

    await this.#moviesService.saveMoviePage(query, {
      page,
      totalPages,
      totalResults,
      movieIds,
    });

    res.json({
      movies: moviesFromAPI.movies,
      totalPages: totalPages,
      totalResults: totalResults,
    });
  };

  getMovieById = async (req, res) => {
    const { id } = req.params;

    const movie = await this.#moviesService.getMovieById(id);

    if (movie) {
      return res.json(movie);
    }

    const apiMovie = await this.#tmdbService.fetchMovieById(id);

    if (!apiMovie) {
      return res.status(404).json({ message: "Filme não encontrado." });
    }

    await this.#moviesService.saveOrUpdateMovie(apiMovie);
    res.json(apiMovie);
  };
}
