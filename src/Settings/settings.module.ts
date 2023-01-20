import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'src/Database/database.module';
import { SettingsGateway } from 'src/Gateways/settings.gateway';
import { RelayService } from 'src/Services/relay.service';
import { SettingsService } from 'src/Services/settings.service';
import { SettingsController } from './settings.controller';
import { settingsProviders } from './settings.provider';
import { SettingsSchema } from './settings.schema';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    RelayService,
    ...settingsProviders,
    SettingsGateway,
  ],
  exports: [],
})
export class SettingsModule {}
