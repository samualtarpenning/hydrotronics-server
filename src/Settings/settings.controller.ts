import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ISettings } from 'src/Interfaces/settingsInterface';
import { SettingsService } from 'src/Services/settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('/getSettings/:id')
  async getSettings(@Param('id') id: string) {
    return await this.settingsService.getSettings(id);
  }
  @Get('/setSettingsId/:id')
  async setSettingsId(@Param('id') id: string) {
    return await this.settingsService.setSettingsId(id);
  }
  @Post('/updateSettings')
  updateSettings(@Body() settings: ISettings) {
    this.settingsService.updateSettings(settings);
  }

  @Get('/setDefaultSettings')
  setDefaultSettings() {
    this.settingsService.setDefaultSettings();
  }

  @Get('/getServerTime')
  getServerTime() {
    this.settingsService.getSystemTime();
  }

  @Post('/updatePumpStatus')
  updatePumpStatus(@Body() status: any) {
    this.settingsService.updatePumpStatus(status.settingsId, status.newStatus);
  }

  @Post('/updatePumpOffSchedule')
  async updatePumpOffSchedule(@Body() pumpOffTime: any) {
    return await this.settingsService.updatePumpOffSchedule(
      pumpOffTime.settigsId,
      pumpOffTime.pumpOffTime,
    );
  }

  @Post('/updatePumpOnSchedule')
  async updatePumpOnSchedule(@Body() pumpOnTime: any) {
    return await this.settingsService.updatePumpOnSchedule(
      pumpOnTime.settigsId,
      pumpOnTime.pumpOnTime,
    );
  }

  // start pump timer
  @Get('/startWateringCycle/:id')
  @HttpCode(200)
  async startWateringCycle(@Param('id') id: string) {
    return await this.settingsService.startPumpCycle(id);
  }

  @Get('/stopWateringCycle/:id')
  async stopWateringCycle(@Param('id') id: string) {
    return await this.settingsService.stopPumpTimer(id);
  }
  @Post('/updateLightStatus')
  updateLightStatus(@Body() status: any) {
    this.settingsService.updateLightStatus(status.settingsId, status.newStatus);
  }
  @Post('/updateFanStatus')
  updateFanStatus(@Body() status: any) {
    this.settingsService.updateFanStatus(status.settingsId, status.newStatus);
  }
  @Get('/startFanCycle/:id')
  @HttpCode(200)
  async startFanCycle(@Param('id') id: string) {
    return await this.settingsService.startFanCycle(id);
  }

  @Get('/stopFanCycle/:id')
  async stopFanCycle(@Param('id') id: string) {
    return await this.settingsService.stopFanTimer(id);
  }
  @Post('/updateFanOffSchedule')
  async updateFanOffSchedule(@Body() fanOffTime: any) {
    return await this.settingsService.updateFanOffSchedule(
      fanOffTime.settigsId,
      fanOffTime.fanOffTime,
    );
  }

  @Post('/updateFanOnSchedule')
  async updateFanOnSchedule(@Body() fanOnTime: any) {
    return await this.settingsService.updateFanOnSchedule(
      fanOnTime.settigsId,
      fanOnTime.fanOnTime,
    );
  }
  @Post('/updateExhaustStatus')
  updateExhaustStatus(@Body() status: any) {
    this.settingsService.updateExhaustStatus(
      status.settingsId,
      status.newStatus,
    );
  }
  @Get('/startExhaustCycle/:id')
  @HttpCode(200)
  async startExhaustCycle(@Param('id') id: string) {
    return await this.settingsService.startExhaustCycle(id);
  }

  @Get('/stopExhaustCycle/:id')
  async stopExhaustCycle(@Param('id') id: string) {
    return await this.settingsService.stopExhaustTimer(id);
  }
  @Post('/updateExhaustOffSchedule')
  async updateExhaustOffSchedule(@Body() exhaustOffTime: any) {
    return await this.settingsService.updateExhaustOffSchedule(
      exhaustOffTime.settingsId,
      exhaustOffTime.fanOffTime,
    );
  }

  @Post('/updateExhaustOnSchedule')
  async updateExhaustOnSchedule(@Body() exhaustOnTime: any) {
    return await this.settingsService.updateExhaustOnSchedule(
      exhaustOnTime.settingsId,
      exhaustOnTime.fanOnTime,
    );
  }

  @Post('/updateLightSchedule')
  async updateLightSchedule(
    @Body()
    {
      lightOnTime,
      lightOffTime,
      settingsId,
    }: {
      lightOnTime: string;
      lightOffTime: string;
      settingsId: string;
    },
  ) {
    return await this.settingsService.updateLightSchedule(
      lightOnTime,
      lightOffTime,
      settingsId,
    );
  }
}
