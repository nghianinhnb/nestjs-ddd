import { IIntegrationEvent } from '../integration-event.interface';
import { IDomainEvent } from '../../domain/domain-event.interface';

export const EVENT_BUS_PORT = 'EVENT_BUS_PORT';

export interface IEventBusPort {
  publish(event: IIntegrationEvent | IDomainEvent): Promise<void>;
  publishAll(events: (IIntegrationEvent | IDomainEvent)[]): Promise<void>;
}
