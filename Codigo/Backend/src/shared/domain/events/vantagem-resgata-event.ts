import { DomainEvent } from './domain-event.js';

export class VantagemResgataEvent extends DomainEvent {
  constructor(
    readonly studentId: string,
    readonly studentName: string,
    readonly studentEmail: string,
    readonly advantageId: string,
    readonly advantageTitle: string,
    readonly partnerName: string,
    readonly partnerEmail: string,
    readonly coinCost: number,
    readonly code: string
  ) {
    super();
  }
}
