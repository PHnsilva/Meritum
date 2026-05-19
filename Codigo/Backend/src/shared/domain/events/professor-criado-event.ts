import { DomainEvent } from './domain-event.js';

export class ProfessorCriadoEvent extends DomainEvent {
  constructor(
    readonly professorId: string,
    readonly professorName: string,
    readonly professorEmail: string,
    readonly institutionName: string,
    readonly tempPassword: string
  ) {
    super();
  }
}
