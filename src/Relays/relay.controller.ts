import { Controller, Get, HttpCode } from '@nestjs/common';
import { RelayService } from 'src/Services/relay.service';

@Controller('relays')
export class RelayController {
  constructor(private readonly relayService: RelayService) {}

  @Get('/lightOff')
  @HttpCode(200)
  lightOff() {
    this.relayService.lightOff();
    return { statusCode: 200, message: 'OK' };
  }
  @Get('/lightOn')
  @HttpCode(200)
  lightOn() {
    this.relayService.lightOn();
    return { statusCode: 200, message: 'OK' };
  }
  @Get('/pumpOff')
  @HttpCode(200)
  pumpOff() {
    this.relayService.pumpOff();
    return { statusCode: 200, message: 'OK' };
  }
  @Get('/pumpOn')
  @HttpCode(200)
  pumpOn() {
    this.relayService.pumpOn();
    return { statusCode: 200, message: 'OK' };
  }
  @Get('/fanOff')
  @HttpCode(200)
  fanOff() {
    this.relayService.fanOn();
    return { statusCode: 200, message: 'OK' };
  }
  @Get('/fanOn')
  @HttpCode(200)
  fanOn() {
    this.relayService.fanOff();
    return { statusCode: 200, message: 'OK' };
  }
}
