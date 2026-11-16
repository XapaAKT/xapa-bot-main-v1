import { createCatalogCommand } from "../../../services/catalog-search.js";

export default createCatalogCommand({
  type: "manga",
  name: "manga",
  description: "Pesquisa mangás no Jikan.",
  countLabel: "Capítulos",
});
