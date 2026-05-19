import { DomainEvent } from './domain-event.js';

export class InstituicaoAprovadaEvent extends DomainEvent {
  constructor(
    readonly institutionId: string,
    readonly institutionName: string,
    readonly userEmail: string,
    readonly userName: string
  ) {
    super();
  }
}
