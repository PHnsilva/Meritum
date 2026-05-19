import { DomainEvent } from './domain-event.js';

export class AlunoCriadoEvent extends DomainEvent {
  constructor(
    readonly studentId: string,
    readonly studentName: string,
    readonly studentEmail: string,
    readonly institutionName: string
  ) {
    super();
  }
}
