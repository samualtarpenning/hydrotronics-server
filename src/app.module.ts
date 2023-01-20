import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TemperatureModule } from './temperature/temperature.module';
import { RelayService } from './Services/relay.service';
import { RelayModule } from './Relays/relay.module';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { SettingsModule } from './Settings/settings.module';
import { SettingsService } from './Services/settings.service';
import { settingsProviders } from './Settings/settings.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { databaseProviders } from './Database/database.provider';
import { TemperatureService } from './Services/temperature.service';
import { temperatureProviders } from './temperature/temperature.provider';
import { SettingsGateway } from './Gateways/settings.gateway';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TemperatureModule,
    RelayModule,
    SettingsModule,
    HttpModule,
    ThrottlerModule.forRoot({
      ttl: 100,
      limit: 1000,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RelayService,
    SettingsService,
    SettingsGateway,
    ...temperatureProviders,
    ...settingsProviders,
    ...databaseProviders,
  ],
})
export class AppModule {}
