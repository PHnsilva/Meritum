import { DomainEvent } from './domain-event.js';

export class UserPasswordChangedEvent extends DomainEvent {
  constructor(
    readonly userId: string,
    readonly userEmail: string
  ) {
    super();
  }
}
