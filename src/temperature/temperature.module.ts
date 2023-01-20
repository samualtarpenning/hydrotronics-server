import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'src/Database/database.module';
import { SettingsGateway } from 'src/Gateways/settings.gateway';
import { TemperatureService } from 'src/Services/temperature.service';
import { TemperatureController } from './temp.controller';
import { temperatureProviders } from './temperature.provider';
import { TemperatureSchema } from './temperature.schema';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [TemperatureController],
  providers: [TemperatureService, ...temperatureProviders, SettingsGateway],
})
export class TemperatureModule {}
