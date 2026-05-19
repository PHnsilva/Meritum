import { DomainEvent } from './domain-event.js';

export class InstituicaoRegistradaEvent extends DomainEvent {
  constructor(
    readonly institutionId: string,
    readonly institutionName: string,
    readonly userEmail: string
  ) {
    super();
  }
}
