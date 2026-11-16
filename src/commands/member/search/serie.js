import { createCatalogCommand } from "../../../services/catalog-search.js";

export default createCatalogCommand({
  type: "tv",
  name: "serie",
  description: "Pesquisa séries no TMDB.",
});
