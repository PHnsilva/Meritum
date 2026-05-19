import { DomainEvent } from './domain-event.js';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_PASSWORD_CHANGED'
  | 'ENTITY_CREATED'
  | 'ENTITY_UPDATED'
  | 'ENTITY_DELETED'
  | 'PERMISSION_DENIED'
  | 'INVALID_OPERATION';

export class AuditEvent extends DomainEvent {
  constructor(
    readonly action: AuditAction,
    readonly userId: string,
    readonly entityType: string,
    readonly entityId: string,
    readonly details: Record<string, any>,
    readonly timestamp: Date = new Date(),
    readonly ipAddress?: string
  ) {
    super();
  }
}
