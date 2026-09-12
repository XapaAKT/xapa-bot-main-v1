/**
 * Classe de erro customizada para
 * parâmetros inválidos.
 *
 * @author Xapa
 */
export default class InvalidParameterError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidParameterError";
  }
}
