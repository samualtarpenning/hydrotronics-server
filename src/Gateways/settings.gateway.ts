import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SettingsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvent(): string {
    return 'Settings Gateway Triggered';
  }
  @SubscribeMessage('lightTimer')
  handleLightTimerUpdate(): string {
    return 'Settings Gateway Triggered';
  }
  @SubscribeMessage('pumpTimer')
  handlePumpTimerUpdate(): string {
    return 'Settings Gateway Triggered';
  }
  @SubscribeMessage('fanTimer')
  handleFanTimerUpdate(): string {
    return 'Settings Gateway Triggered';
  }
  @SubscribeMessage('exhaustTimer')
  handleExhaustTimerUpdate(): string {
    return 'Settings Gateway Triggered';
  }
  @SubscribeMessage('zoneChange')
  handleZoneChange(): any {
    return 'Settings Gateway Triggered';
  }

  @SubscribeMessage('temperature')
  handleTemperatureUpdate(): string {
    return 'Settings Gateway Triggered';
  }
  @SubscribeMessage('temperatureChart')
  handleTemperatureChartUpdate(): string {
    return 'Settings Gateway Triggered';
  }
}
