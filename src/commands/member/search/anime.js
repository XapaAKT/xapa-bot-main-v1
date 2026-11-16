import { createCatalogCommand } from "../../../services/catalog-search.js";

export default createCatalogCommand({
  type: "anime",
  name: "anime",
  description: "Pesquisa animes no Jikan.",
  countLabel: "Episódios",
});
