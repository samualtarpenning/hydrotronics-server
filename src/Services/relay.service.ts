import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SettingsGateway } from 'src/Gateways/settings.gateway';
import { SettingsService } from './settings.service';

@Injectable()
export class RelayService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger('System');
  async lightOff(): Promise<any> {
    await this.httpService
      .get('http://192.168.1.4/lightOff')
      .subscribe((res) => {
        if (res.data) {
          this.logger.log('lights turned off');

          return { response: res.data };
        } else {
          this.logger.error('lights failed to turn off');
          return { response: 'error: system error' };
        }
      });
  }
  async lightOn(): Promise<any> {
    await this.httpService
      .get('http://192.168.1.4/lightOn')
      .subscribe((res) => {
        if (res.data) {
          this.logger.log('lights turned on');

          return { response: res.data };
        } else {
          this.logger.error('lights failed to turn on');
          return { response: 'error: system error' };
        }
      });
  }
  async pumpOff(): Promise<any> {
    await this.httpService
      .get('http://192.168.1.4/pumpOff')
      .subscribe((res) => {
        if (res.data) {
          this.logger.log('pump turned off');

          return { response: res.data };
        } else {
          this.logger.error('pump failed to turn off');
          return { response: 'error: system error' };
        }
      });
  }
  async pumpOn(): Promise<any> {
    await this.httpService.get('http://192.168.1.4/pumpOn').subscribe((res) => {
      if (res.data) {
        this.logger.log('pump turned on');

        return { response: res.data };
      } else {
        this.logger.error('pump failed to turn on');
        return { response: 'error: system error' };
      }
    });
  }
  async fanOff(): Promise<any> {
    await this.httpService.get('http://192.168.1.4/fanOff').subscribe((res) => {
      if (res.data) {
        this.logger.log('fan turned off');

        return { response: res.data };
      } else {
        this.logger.error('fan failed to turn off');
        return { response: 'error: system error' };
      }
    });
  }
  async fanOn(): Promise<any> {
    await this.httpService.get('http://192.168.1.4/fanOn').subscribe((res) => {
      if (res.data) {
        this.logger.log('fan turned on');
        return { response: res.data };
      } else {
        this.logger.error('fan failed to turn on');
        return { response: 'error: system error' };
      }
    });
  }
}
