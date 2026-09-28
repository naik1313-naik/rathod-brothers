/**
 * Application-level error type.
 *
 * Throwing `ApiError` anywhere in the request pipeline is the intended way to
 * fail a request: the global error handler turns it into a clean JSON response
 * with an appropriate status code and a message that is safe to show a user.
 * Anything that is *not* an ApiError is treated as an unexpected bug and is
 * logged in full while the client receives a generic 500.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly fields?: Record<string, string>;
  /** Extra context for the logs only — never sent to the client. */
  readonly internal?: unknown;

  constructor(
    statusCode: number,
    message: string,
    options: { code?: string; fields?: Record<string, string>; internal?: unknown } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = options.code ?? defaultCodeFor(statusCode);
    this.fields = options.fields;
    this.internal = options.internal;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = 'Invalid request.', fields?: Record<string, string>): ApiError {
    return new ApiError(400, message, { code: 'BAD_REQUEST', fields });
  }

  static validation(message = 'Please correct the highlighted fields.', fields?: Record<string, string>): ApiError {
    return new ApiError(422, message, { code: 'VALIDATION_ERROR', fields });
  }

  static unauthorized(message = 'Authentication required.'): ApiError {
    return new ApiError(401, message, { code: 'UNAUTHORIZED' });
  }

  static forbidden(message = 'You do not have access to this resource.'): ApiError {
    return new ApiError(403, message, { code: 'FORBIDDEN' });
  }

  static notFound(message = 'The requested resource was not found.'): ApiError {
    return new ApiError(404, message, { code: 'NOT_FOUND' });
  }

  static conflict(message = 'That record already exists.'): ApiError {
    return new ApiError(409, message, { code: 'CONFLICT' });
  }

  static tooManyRequests(message = 'Too many requests. Please try again shortly.'): ApiError {
    return new ApiError(429, message, { code: 'RATE_LIMITED' });
  }

  static internal(message = 'Something went wrong on our end. Please try again.'): ApiError {
    return new ApiError(500, message, { code: 'INTERNAL_ERROR' });
  }
}

function defaultCodeFor(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'RATE_LIMITED';
    default:
      return statusCode >= 500 ? 'INTERNAL_ERROR' : 'ERROR';
  }
}
