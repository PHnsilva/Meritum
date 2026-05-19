/**
 * Domain Error Hierarchy — Type-safe error handling
 */

export abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainException {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

export class AuthenticationError extends DomainException {
  readonly code = 'AUTHENTICATION_ERROR';
  readonly statusCode = 401;
}

export class OwnershipError extends DomainException {
  readonly code = 'OWNERSHIP_ERROR';
  readonly statusCode = 403;
}

export class NotFoundError extends DomainException {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
}

export class ConflictError extends DomainException {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;
}

export class InsufficientBalanceError extends DomainException {
  readonly code = 'INSUFFICIENT_BALANCE';
  readonly statusCode = 400;
}

export class AccountPendingError extends DomainException {
  readonly code = 'ACCOUNT_PENDING';
  readonly statusCode = 403;
}

export class DomainBusinessRuleError extends DomainException {
  readonly code = 'BUSINESS_RULE_VIOLATION';
  readonly statusCode = 400;
}
