/**
 * Classe de erro customizada para
 * erros críticos.
 *
 * @author Xapa
 */
export default class DangerError extends Error {
  constructor(message) {
    super(message);
    this.name = "DangerError";
  }
}
