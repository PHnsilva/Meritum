import { DomainEvent } from './domain-event.js';

export class MoedasEnviadasEvent extends DomainEvent {
  constructor(
    readonly professorId: string,
    readonly professorName: string,
    readonly professorEmail: string,
    readonly studentId: string,
    readonly studentName: string,
    readonly studentEmail: string,
    readonly amount: number,
    readonly motive: string
  ) {
    super();
  }
}
