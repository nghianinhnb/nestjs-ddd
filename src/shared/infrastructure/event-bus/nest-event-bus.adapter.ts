import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventBus as NestCqrsEventBus } from '@nestjs/cqrs';
import { IEventBusPort } from '../../application/ports/event-bus.port';
import { IIntegrationEvent } from '../../application/integration-event.interface';
import { IDomainEvent } from '../../domain/domain-event.interface';

@Injectable()
export class NestEventBusAdapter implements IEventBusPort {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly cqrsEventBus: NestCqrsEventBus,
  ) {}

  async publish(event: IIntegrationEvent | IDomainEvent): Promise<void> {
    const eventName = event.constructor.name;
    // Emit through EventEmitter2 for integration & domain events across modules
    await this.eventEmitter.emitAsync(eventName, event);
    // Also publish through NestJS CQRS EventBus if needed
    this.cqrsEventBus.publish(event);
  }

  async publishAll(events: (IIntegrationEvent | IDomainEvent)[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
