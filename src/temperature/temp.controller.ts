import { Model } from 'mongoose';
import {
  Injectable,
  Inject,
  Get,
  Controller,
  Body,
  Post,
  Logger,
  HttpCode,
  Param,
} from '@nestjs/common';
import { ITemperature } from './temperature.interface';
import { TemperatureService } from 'src/Services/temperature.service';
import * as moment from 'moment-timezone';
import { format } from 'path';

@Controller('temperature')
export class TemperatureController {
  constructor(private temperatureService: TemperatureService) {}
  @Get('/GetTempByHour/:settingsId')
  @HttpCode(200)
  async getWeekTemp(@Param('settingsId') settingsId: string) {
    // const temperatures = await this.temperatureService.findAllByHour(
    //   settingsId,
    // );
    // const groupByHour = temperatures.reduce((acc, cur: any) => {
    //   const hour = moment(cur.date).format('h a');
    //   if (!acc[hour]) {
    //     acc[hour] = [];
    //   }
    //   acc[hour].push(cur);
    //   return acc;
    // }, {});

    // return { temperatures: groupByHour };
  }

  @Get('/getCurrentTemperature')
  @HttpCode(200)
  async getCurrentTemperature() {
    return this.temperatureService.getCurrentTemperature();
  }
  @Get('/getVpd')
  @HttpCode(200)
  async getVpd() {
    return this.temperatureService.getVpd();
  }
}
