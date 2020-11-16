export default class NetworkError extends Error {
  code = 500;

  constructor(code, options = { message: "" }) {
    this.message = message;

    if (code != null) {
      this.code = code;
    }
  }
}
