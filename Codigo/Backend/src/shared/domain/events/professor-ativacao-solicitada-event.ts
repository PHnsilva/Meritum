import { DomainEvent } from './domain-event.js';

export class ProfessorAtivacaoSolicitadaEvent extends DomainEvent {
  constructor(
    readonly professorEmail: string,
    readonly professorName: string,
    readonly tempPassword: string
  ) {
    super();
  }
}
