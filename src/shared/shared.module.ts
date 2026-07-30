import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EVENT_BUS_PORT } from './application/ports/event-bus.port';
import { NestEventBusAdapter } from './infrastructure/event-bus/nest-event-bus.adapter';

@Global()
@Module({
  imports: [
    CqrsModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
  ],
  providers: [
    {
      provide: EVENT_BUS_PORT,
      useClass: NestEventBusAdapter,
    },
  ],
  exports: [CqrsModule, EventEmitterModule, EVENT_BUS_PORT],
})
export class SharedModule {}
