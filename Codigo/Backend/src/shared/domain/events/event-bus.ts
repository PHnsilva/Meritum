import { EventEmitter } from 'node:events';
import type { DomainEvent } from './domain-event.js';

type Handler<T extends DomainEvent> = (event: T) => void | Promise<void>;
type EventConstructor<T extends DomainEvent> = abstract new (...args: never[]) => T;

export interface EventTransport {
  publish(eventName: string, event: DomainEvent): Promise<void>;
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): Promise<void>;
  close(): Promise<void>;
}

class EventBus extends EventEmitter {
  private transport: EventTransport | null = null;
  private readonly transportedEvents = new Set<string>();

  useTransport(transport: EventTransport): void {
    this.transport = transport;
    this.transportedEvents.clear();
  }

  publish(event: DomainEvent): void {
    const eventName = event.constructor.name;

    if (!this.transport) {
      this.emit(eventName, event);
      return;
    }

    void this.transport.publish(eventName, event).catch((err) => {
      console.error(`[EventBus] transport publish error for ${eventName}:`, err);
      this.emit(eventName, event);
    });
  }

  async subscribe<T extends DomainEvent>(
    eventClass: EventConstructor<T>,
    handler: Handler<T>
  ): Promise<void> {
    const eventName = eventClass.name;
    const wrappedHandler = (event: T) => Promise.resolve(handler(event));

    this.on(eventName, (event: T) => {
      void wrappedHandler(event).catch((err) => {
        console.error(`[EventBus] handler error for ${eventName}:`, err);
      });
    });

    if (!this.transport || this.transportedEvents.has(eventName)) {
      return;
    }

    this.transportedEvents.add(eventName);
    await this.transport.subscribe(eventName, async (event) => {
      this.emit(eventName, event);
    });
  }

  clearSubscribers(): void {
    this.removeAllListeners();
    this.transportedEvents.clear();
  }

  async closeTransport(): Promise<void> {
    await this.transport?.close();
    this.transport = null;
    this.transportedEvents.clear();
  }
}

export const eventBus = new EventBus();
