export class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }

  send(res) {
    return res.status(this.status).json({ message: this.message });
  }
}

export class BadRequestError extends ErrorResponse {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

export class NotFoundError extends ErrorResponse {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class InternalError extends ErrorResponse {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}

