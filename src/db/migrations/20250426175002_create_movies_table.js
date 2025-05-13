/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.schema
    .createTable("movies", (table) => {
      table.integer("id").primary();
      table.string("title");
      table.text("overview");
      table.date("release_date").nullable();
      table.string("poster_path");
      table.float("vote_average");
      table.boolean("adult").defaultTo(false);
      table.string("backdrop_path");
      table.specificType("genre_ids", "integer[]");
      table.string("original_language");
      table.string("original_title");
      table.float("popularity");
      table.boolean("video").defaultTo(false);
      table.integer("vote_count");
      table.enu("type", ["movie", "tv"]).notNullable().defaultTo("movie");
    })
    .createTable("movie_pages", (table) => {
      table.increments("id").primary();
      table.string("query");
      table.string("normalized_query"); 
      table.integer("page_number");
      table.specificType("movie_ids", "integer[]");
      table.integer("total_pages");
      table.integer("total_results");
      table.unique(["normalized_query", "page_number"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("movies")
    .dropTableIfExists("movie_pages");
};
