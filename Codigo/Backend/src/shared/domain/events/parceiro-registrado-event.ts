import { DomainEvent } from './domain-event.js';

export class ParceiroRegistradoEvent extends DomainEvent {
  constructor(
    readonly partnerId: string,
    readonly partnerName: string,
    readonly partnerEmail: string
  ) {
    super();
  }
}
