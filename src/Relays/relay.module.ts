import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SettingsGateway } from 'src/Gateways/settings.gateway';
import { RelayService } from 'src/Services/relay.service';
import { RelayController } from './relay.controller';

@Module({
  imports: [HttpModule],
  controllers: [RelayController],
  providers: [RelayService, SettingsGateway],
})
export class RelayModule {}
