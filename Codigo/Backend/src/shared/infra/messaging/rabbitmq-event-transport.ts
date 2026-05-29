import { connect, type ConfirmChannel, type ChannelModel, type ConsumeMessage } from 'amqplib';
import type { DomainEvent } from '../../domain/events/domain-event.js';
import type { EventTransport } from '../../domain/events/event-bus.js';

type RabbitEventPayload = Record<string, unknown> & {
  occurredAt?: string;
};

export class RabbitMqEventTransport implements EventTransport {
  private connection: ChannelModel | null = null;
  private channel: ConfirmChannel | null = null;
  private readonly consumerTags = new Set<string>();

  constructor(
    private readonly url: string,
    private readonly exchange = 'meritum.domain-events',
    private readonly queuePrefix = 'meritum',
    private readonly deadLetterExchange = `${exchange}.dead-letter`
  ) {}

  async connect(): Promise<void> {
    this.connection = await connect(this.url);
    this.channel = await this.connection.createConfirmChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    await this.channel.assertExchange(this.deadLetterExchange, 'topic', { durable: true });
    await this.channel.prefetch(10);
  }

  async publish(eventName: string, event: DomainEvent): Promise<void> {
    const channel = this.getChannel();
    const payload = Buffer.from(JSON.stringify(event));
    const published = channel.publish(this.exchange, eventName, payload, {
      contentType: 'application/json',
      deliveryMode: 2,
      persistent: true,
      timestamp: Date.now(),
      type: eventName,
    });

    if (!published) {
      await new Promise<void>((resolve) => channel.once('drain', resolve));
    }

    await channel.waitForConfirms();
  }

  async subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): Promise<void> {
    const channel = this.getChannel();
    const queue = `${this.queuePrefix}.${eventName}`;
    const deadLetterQueue = `${queue}.dead-letter`;

    await channel.assertQueue(deadLetterQueue, { durable: true });
    await channel.bindQueue(deadLetterQueue, this.deadLetterExchange, eventName);
    await channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: this.deadLetterExchange,
      deadLetterRoutingKey: eventName,
    });
    await channel.bindQueue(queue, this.exchange, eventName);
    const consumer = await channel.consume(queue, (message) => {
      void this.handleMessage(message, handler);
    }, {
      noAck: false,
    });
    this.consumerTags.add(consumer.consumerTag);
  }

  async close(): Promise<void> {
    if (this.channel) {
      for (const consumerTag of this.consumerTags) {
        await this.channel.cancel(consumerTag);
      }

      await this.channel.close();
    }

    await this.connection?.close();
    this.consumerTags.clear();
    this.channel = null;
    this.connection = null;
  }

  private async handleMessage(
    message: ConsumeMessage | null,
    handler: (event: DomainEvent) => Promise<void>
  ): Promise<void> {
    if (!message) {
      return;
    }

    const channel = this.getChannel();

    try {
      const payload = JSON.parse(message.content.toString('utf8')) as RabbitEventPayload;
      const event = this.toDomainEvent(payload);
      await handler(event);
      channel.ack(message);
    } catch (error) {
      console.error('[RabbitMQ] failed to process event message:', error);
      channel.nack(message, false, false);
    }
  }

  private toDomainEvent(payload: RabbitEventPayload): DomainEvent {
    return {
      ...payload,
      occurredAt: payload.occurredAt ? new Date(payload.occurredAt) : new Date(),
    } as DomainEvent;
  }

  private getChannel(): ConfirmChannel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not connected');
    }

    return this.channel;
  }
}
