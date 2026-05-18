import { EventEmitter } from 'node:events';
import type { DomainEvent } from './domain-event.js';

type Handler<T extends DomainEvent> = (event: T) => void | Promise<void>;

class EventBus extends EventEmitter {
  publish(event: DomainEvent): void {
    this.emit(event.constructor.name, event);
  }

  subscribe<T extends DomainEvent>(
    eventClass: abstract new (...args: never[]) => T,
    handler: Handler<T>
  ): void {
    this.on(eventClass.name, (event: T) => {
      void Promise.resolve(handler(event)).catch((err) => {
        console.error(`[EventBus] handler error for ${eventClass.name}:`, err);
      });
    });
  }
}

export const eventBus = new EventBus();
