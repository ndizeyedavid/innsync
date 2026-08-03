import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEventName, EventPayloads } from './domain-events';

/**
 * Typed wrapper around EventEmitter2.
 *
 * Why wrap it: gives us a single chokepoint to add tracing, metrics, and a
 * future Kafka tee — without rewriting every emit site.
 */
@Injectable()
export class EventBus {
  private readonly logger = new Logger(EventBus.name);

  constructor(private readonly emitter: EventEmitter2) {}

  emit<E extends DomainEventName>(event: E, payload: EventPayloads[E]): void {
    this.logger.debug({ event, payload }, 'event emit');
    this.emitter.emit(event, payload);
  }

  /**
   * Programmatic subscribe (rare — usually prefer @OnEvent in services).
   * Returns an unsubscribe function.
   */
  on<E extends DomainEventName>(
    event: E,
    handler: (payload: EventPayloads[E]) => void | Promise<void>,
  ): () => void {
    this.emitter.on(event, handler);
    return () => this.emitter.off(event, handler);
  }
}
