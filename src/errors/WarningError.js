/**
 * Classe de erro customizada para
 * avisos.
 *
 * @author Xapa
 */
export default class WarningError extends Error {
  constructor(message) {
    super(message);
    this.name = "WarningError";
  }
}
