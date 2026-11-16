import { createCatalogCommand } from "../../../services/catalog-search.js";

export default createCatalogCommand({
  type: "movie",
  name: "filme",
  description: "Pesquisa filmes no TMDB.",
});
