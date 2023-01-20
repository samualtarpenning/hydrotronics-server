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
} from '@nestjs/common';
import { ITemperature } from './temperature.interface';
import { TemperatureService } from 'src/Services/temperature.service';
import * as moment from 'moment-timezone';
import { format } from 'path';

@Controller('temperature')
export class TemperatureController {
  constructor(private temperatureService: TemperatureService) {}
  @Get('/GetTempByHour')
  @HttpCode(200)
  async getWeekTemp() {
    const temperatures: any = await this.temperatureService.findAll();
    const groupByHour = temperatures.reduce((group, temp) => {
      let newArry = [];
      // const { hour } = moment(temp.timestamp).tz("America/Chicago").hour();
      group[moment(temp.timestamp).tz('America/Chicago').hour()] =
        group[moment(temp.timestamp).tz('America/Chicago').hour()] ?? [];
      newArry[moment(temp.timestamp).tz('America/Chicago').hour()] =
        newArry[moment(temp.timestamp).tz('America/Chicago').hour()] ?? [];
      newArry[moment(temp.timestamp).tz('America/Chicago').hour()].push(
        temp.temperature,
      );
      group[moment(temp.timestamp).tz('America/Chicago').hour()] = newArry[
        moment(temp.timestamp).tz('America/Chicago').hour()
      ].reduce((a, c) => a + c, 0);
      group[moment(temp.timestamp).tz('America/Chicago').hour()] =
        group[moment(temp.timestamp).tz('America/Chicago').hour()] /
        newArry[moment(temp.timestamp).tz('America/Chicago').hour()].length;
      return group;
    }, {});
    return { temperatures: groupByHour };
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
