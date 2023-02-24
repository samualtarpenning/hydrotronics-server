import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class RelayService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger('System');
  async lightOff(connection: string): Promise<any> {
    await this.httpService.get(connection + '/lightOff').subscribe((res) => {
      if (res.data) {
        this.logger.log('lights turned off');

        return { response: res.data };
      } else {
        this.logger.error('lights failed to turn off');
        return { response: 'error: system error' };
      }
    });
  }
  async lightOn(connection: string): Promise<any> {
    await this.httpService.get(connection + '/lightOn').subscribe((res) => {
      if (res.data) {
        this.logger.log('lights turned on');

        return { response: res.data };
      } else {
        this.logger.error('lights failed to turn on');
        return { response: 'error: system error' };
      }
    });
  }
  async pumpOff(connection: string): Promise<any> {
    await this.httpService.get(connection + '/pumpOff').subscribe((res) => {
      if (res.data) {
        this.logger.log('pump turned off');

        return { response: res.data };
      } else {
        this.logger.error('pump failed to turn off');
        return { response: 'error: system error' };
      }
    });
  }
  async pumpOn(connection: string): Promise<any> {
    await this.httpService.get(connection + '/pumpOn').subscribe((res) => {
      if (res.data) {
        this.logger.log('pump turned on');

        return { response: res.data };
      } else {
        this.logger.error('pump failed to turn on');
        return { response: 'error: system error' };
      }
    });
  }
  async fanOff(connection: string): Promise<any> {
    await this.httpService.get(connection + '/fanOff').subscribe((res) => {
      if (res.data) {
        this.logger.log('fan turned off');
        return { response: res.data };
      } else {
        this.logger.error('fan failed to turn off');
        return { response: 'error: system error' };
      }
    });
  }
  async fanOn(connection: string): Promise<any> {
    await this.httpService.get(connection + '/fanOn').subscribe((res) => {
      if (res.data) {
        this.logger.log('fan turned on');
        return { response: res.data };
      } else {
        this.logger.error('fan failed to turn on');
        return { response: 'error: system error' };
      }
    });
  }

  async exhaustOff(connection: string): Promise<any> {
    await this.httpService.get(connection + '/exhaustOff').subscribe((res) => {
      if (res.data) {
        this.logger.log('exhaust turned off');
        return { response: res.data };
      } else {
        this.logger.error('exhaust failed to turn off');
        return { response: 'error: system error' };
      }
    });
  }
  async exhaustOn(connection: string): Promise<any> {
    await this.httpService.get(connection + '/exhaustOn').subscribe((res) => {
      if (res.data) {
        this.logger.log('exhaust turned on');
        return { response: res.data };
      } else {
        this.logger.error('exhaust failed to turn on');
        return { response: 'error: system error' };
      }
    });
  }
}
