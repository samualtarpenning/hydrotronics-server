import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as moment from 'moment';
import { ISettings } from 'src/Interfaces/settingsInterface';
import { RelayService } from './relay.service';
import { SettingsGateway } from 'src/Gateways/settings.gateway';
// dev settings 63063f8657c91e0cfcdac764
// prod settings 626159dcbe8092281f5bc30d

@Injectable()
export class SettingsService {
  settings: ISettings;
  settingsId: string = '639e769b119143ff3ff6b267';
  duration: any;
  remainingDuration: any;
  completedPercentage: number;
  constructor(
    @Inject('SETTINGS_MODEL')
    private settingsModel: Model<ISettings>,
    private readonly relayService: RelayService,
    private schedulerRegistry: SchedulerRegistry,
    private gatewayService: SettingsGateway,
  ) {}
  private readonly logger = new Logger('SettingsService');
  getSystemTime() {
    return moment().format('HH:mm:ss');
  }

  setDefaultSettings(): ISettings {
    const _settings = new this.settingsModel({
      light: {
        lightOnTime: '06:00',
        lightOffTime: '22:00',
        status: false,
      },
      pump: {
        pumpOnTime: 10000,
        pumpOffTime: 10000,
        status: false,
        cycling: false,
        timerStarted: '19:00:00',
      },
      fan: {
        fanOnTime: 10000,
        fanOffTime: 10000,
        status: false,
      },
      exhaust: {
        fanOnTime: 10000,
        fanOffTime: 10000,
        status: false,
      },
    });
    _settings.save();
    return _settings;
  }

  async updateSettings(settings: ISettings): Promise<ISettings> {
    const _settings = await this.settingsModel.findOneAndUpdate({}, settings, {
      new: true,
    });
    return _settings.save();
  }

  setSettingsId(id: string) {
    const pump_timer_job = this.schedulerRegistry.getCronJob('pumpTimer');
    pump_timer_job.running ? pump_timer_job.stop() : null;
    const fan_timer_job = this.schedulerRegistry.getCronJob('fanTimer');
    fan_timer_job.running ? fan_timer_job.stop() : null;
    const exhaust_timer_job = this.schedulerRegistry.getCronJob('exhaustTimer');
    exhaust_timer_job.running ? exhaust_timer_job.stop() : null;
    this.settingsId = id;
    pump_timer_job.start();
    fan_timer_job.start();
    exhaust_timer_job.start();
    return this.settingsId;
  }

  getSettingsId() {
    return this.settingsId;
  }

  async getSettings(id: string): Promise<ISettings> {
    this.settings = await this.settingsModel.findById(id);

    // this.settingsId = id;
    return this.settings;
  }
  // PUMP METHODS
  async updatePumpStatus(
    settingsId: string,
    _status: boolean,
  ): Promise<Boolean> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      this.settingsId,
      {
        $set: {
          pump: {
            pumpOnTime: this.settings.pump.pumpOnTime,
            pumpOffTime: this.settings.pump.pumpOffTime,
            cycling: this.settings.pump.cycling,
            timerStarted: this.settings.pump.timerStarted,
            status: _status,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    _status === false
      ? this.relayService.pumpOff()
      : this.relayService.pumpOn();
    this.logger.log(
      `Pump status changed to ${_status ? 'Active' : 'Inactive'}`,
    );
    return this.settings.pump.status;
  }

  private readonly pumpOnLogger = new Logger('PumpSchedule');
  async updatePumpOnSchedule(
    settingsId,
    _pumpOnTime: number,
  ): Promise<ISettings> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      this.settingsId,
      {
        $set: {
          pump: {
            pumpOnTime: _pumpOnTime,
            pumpOffTime: this.settings.pump.pumpOffTime,
            cycling: this.settings.pump.cycling,
            timerStarted: this.settings.pump.timerStarted,
            status: this.settings.pump.status,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    this.pumpOnLogger.log(
      `Pump set to turn off in ${_pumpOnTime / 1000 / 60} minutes`,
    );
    return _settings;
  }

  public async updatePumpOffSchedule(
    settingsId,
    _pumpOffTime: number,
  ): Promise<ISettings> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      this.settingsId,
      {
        $set: {
          pump: {
            pumpOnTime: this.settings.pump.pumpOnTime,
            pumpOffTime: _pumpOffTime,
            cycling: this.settings.pump.cycling,
            status: this.settings.pump.status,
            timerStarted: this.settings.pump.timerStarted,
          },
        },
      },
      { new: true },
    );
    this.pumpOnLogger.log(
      `Pump set to turn off in ${_pumpOffTime / 1000 / 60} minutes`,
    );
    this.settings = _settings;
    return _settings;
  }

  // setting the pump on schedule
  async pumpOnSchedule(settingsId) {
    this.logger.log(`${settingsId} on schedule ${moment().format('HH:mm:ss')}`);
    this.getSettings(settingsId);
    const callback = async () => {
      const _settings = await this.settingsModel.findById(settingsId);
      this.pumpOnLogger.log(`Interval ${'PumpOnTimer'} executing....`);
      this.schedulerRegistry.doesExist('interval', `PumpOnTimer${settingsId}`)
        ? this.schedulerRegistry.deleteInterval(`PumpOnTimer${settingsId}`)
        : null;
      this.pumpOnLogger.log(`Interval ${`PumpOnTimer${settingsId}`} deleted!`);
      this.pumpOffSchedule(settingsId);
      await this.settingsModel.findByIdAndUpdate(
        settingsId,
        {
          $set: {
            pump: {
              pumpOnTime: _settings.pump.pumpOnTime,
              pumpOffTime: _settings.pump.pumpOffTime,
              status: false,
              cycling: true,
              timerStarted: moment(new Date()).format('HH:mm:ss'),
            },
          },
        },
        { new: true },
      );
      // this.relayService.pumpOff();
      if (settingsId === this.settingsId) {
        this.gatewayService.server.emit('events', _settings);
      }
      this.pumpOnLogger.log(
        `Pump on time changed to ${
          this.settings.pump.pumpOnTime / 1000 / 60
        } minutes`,
      );
    };

    const _settings = await this.settingsModel.findById(settingsId);

    const interval = setInterval(callback, _settings.pump.pumpOnTime);
    this.schedulerRegistry.addInterval(`PumpOnTimer${settingsId}`, interval);
    this.pumpOnLogger.log(`Interval ${settingsId} added!`);
  }

  // setting the pump off schedule
  async pumpOffSchedule(settingsId) {
    this.logger.log(
      `${settingsId} on schedule ${moment(new Date()).format('HH:mm:ss')}`,
    );
    const _settings = await this.settingsModel.findById(settingsId);
    this.getSettings(settingsId);

    const callback = async () => {
      this.logger.warn(`Interval ${'PumpOffTimer'} executing`);
      this.schedulerRegistry.doesExist('interval', `PumpOffTimer${settingsId}`)
        ? this.schedulerRegistry.deleteInterval(`PumpOffTimer${settingsId}`)
        : null;
      // this.relayService.pumpOn();
      await this.settingsModel.findByIdAndUpdate(
        settingsId,
        {
          $set: {
            pump: {
              pumpOnTime: _settings.pump.pumpOnTime,
              pumpOffTime: _settings.pump.pumpOffTime,
              status: true,
              cycling: true,
              timerStarted: moment(new Date()).format('HH:mm:ss'),
            },
          },
        },
        { new: true },
      );
      this.pumpOnSchedule(settingsId);
      if (settingsId === this.settingsId) {
        this.gatewayService.server.emit('events', this.settings);
      }
    };
    this.logger.log(
      `Pump status changed to ${_settings.pump.status ? 'Active' : 'Inactive'}`,
    );
    const interval = setInterval(callback, _settings.pump.pumpOffTime);
    this.schedulerRegistry.addInterval(`PumpOffTimer${settingsId}`, interval);
  }

  async stopPumpTimer(settingsId) {
    // this.relayService.pumpOff();
    this.schedulerRegistry.doesExist('interval', `PumpOnTimer${settingsId}`)
      ? this.schedulerRegistry.deleteInterval(`PumpOnTimer${settingsId}`)
      : null;
    this.schedulerRegistry.doesExist('interval', `PumpOffTimer${settingsId}`)
      ? this.schedulerRegistry.deleteInterval(`PumpOffTimer${settingsId}`)
      : null;
    const _settings = await this.settingsModel.findByIdAndUpdate(
      settingsId,
      {
        $set: {
          pump: {
            pumpOnTime: this.settings.pump.pumpOnTime,
            pumpOffTime: this.settings.pump.pumpOffTime,
            timerStarted: '',
            status: false,
            cycling: false,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    this.logger.warn(`Pump cycle stopped`);
    return _settings;
  }
  async startPumpCycle(settingsId) {
    this.settingsId = settingsId;
    this.pumpOnSchedule(settingsId);
    // await this.relayService.pumpOn();
    const _settings = await this.settingsModel.findByIdAndUpdate(
      settingsId,
      {
        $set: {
          pump: {
            pumpOnTime: this.settings.pump.pumpOnTime,
            pumpOffTime: this.settings.pump.pumpOffTime,
            timerStarted: moment(new Date()).format('HH:mm:ss'),
            status: true,
            cycling: true,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    this.gatewayService.server.emit('events', this.settings);
    this.logger.warn(`Pump cycle started`);
    return _settings;
  }

  // LIGHT METHODS
  async updateLightSchedule(
    _lightOnTime: string,
    _lightOffTime: string,
    settingsId: string,
  ): Promise<ISettings> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      this.settingsId,
      {
        $set: {
          light: {
            lightOnTime: _lightOnTime,
            lightOffTime: _lightOffTime,
            status: this.settings.light.status,
          },
        },
      },
      { new: true },
    );

    this.settings = _settings;
    this.logger.log(
      `Light set to turn on @ ${this.settings.light.lightOnTime} light set to turn off @ ${this.settings.light.lightOffTime}`,
    );
    return _settings;
  }

  async updateLightStatus(settingsId, _status: boolean): Promise<ISettings> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      settingsId,
      {
        $set: {
          light: {
            lightOnTime: this.settings.light.lightOnTime,
            lightOffTime: this.settings.light.lightOffTime,
            status: _status,
          },
        },
      },
      { new: true },
    );
    _status === false
      ? this.relayService.lightOff()
      : this.relayService.lightOn();
    this.settings = _settings;
    this.logger.log(
      `Light status changed to ${
        this.settings.light.status ? 'Active' : 'Inactive'
      }`,
    );

    return _settings;
  }

  async updateFanStatus(
    settingsId: string,
    _status: boolean,
  ): Promise<ISettings> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      settingsId,
      {
        $set: {
          fan: {
            fanOnTime: this.settings.fan.fanOnTime,
            fanOffTime: this.settings.fan.fanOffTime,
            timerStarted: '',
            cycling: this.settings.fan.cycling,
            status: _status,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    _status == false ? this.relayService.fanOff() : this.relayService.fanOn();
    this.logger.log(
      `Fan ${this.settings.id} status changed to ${
        this.settings.fan.status ? 'Active' : 'Inactive'
      }`,
    );

    return _settings;
  }
  // setting the pump on schedule
  async fanOnSchedule(settingsId) {
    this.logger.log(
      `Fan: ${settingsId} on schedule ${moment().format('HH:mm:ss')}`,
    );
    this.getSettings(settingsId);
    const callback = async () => {
      const _settings = await this.settingsModel.findById(settingsId);
      this.fanOnLogger.log(`Interval ${'FanOnTimer'} executing....`);
      this.schedulerRegistry.doesExist('interval', `FanOnTimer${settingsId}`)
        ? this.schedulerRegistry.deleteInterval(`FanOnTimer${settingsId}`)
        : null;
      this.fanOnLogger.log(`Interval ${`FanOnTimer${settingsId}`} deleted!`);
      this.fanOffSchedule(settingsId);
      await this.settingsModel.findByIdAndUpdate(
        settingsId,
        {
          $set: {
            fan: {
              fanOnTime: _settings.fan.fanOnTime,
              fanOffTime: _settings.fan.fanOffTime,
              status: false,
              cycling: true,
              timerStarted: moment(new Date()).format('HH:mm:ss'),
            },
          },
        },
        { new: true },
      );
      // this.relayService.pumpOff();
      if (settingsId === this.settingsId) {
        this.gatewayService.server.emit('events', _settings);
      }
      this.fanOnLogger.log(
        `Fan set to ${this.settings.pump.pumpOnTime / 1000 / 60} minutes`,
      );
    };

    const _settings = await this.settingsModel.findById(settingsId);

    const interval = setInterval(callback, _settings.fan.fanOnTime);
    this.schedulerRegistry.addInterval(`FanOnTimer${settingsId}`, interval);
    this.pumpOnLogger.log(`Interval ${settingsId} added!`);
  }

  async fanOffSchedule(settingsId) {
    this.logger.log(
      `${settingsId} fan off schedule ${moment(new Date()).format('HH:mm:ss')}`,
    );
    const _settings = await this.settingsModel.findById(settingsId);
    this.getSettings(settingsId);

    const callback = async () => {
      this.logger.warn(`Interval ${'FanOffTimer'} executing`);
      this.schedulerRegistry.doesExist('interval', `FanOffTimer${settingsId}`)
        ? this.schedulerRegistry.deleteInterval(`FanOffTimer${settingsId}`)
        : null;
      // this.relayService.pumpOn();
      await this.settingsModel.findByIdAndUpdate(
        settingsId,
        {
          $set: {
            fan: {
              fanOnTime: _settings.fan.fanOnTime,
              fanOffTime: _settings.fan.fanOffTime,
              status: true,
              cycling: true,
              timerStarted: moment(new Date()).format('HH:mm:ss'),
            },
          },
        },
        { new: true },
      );
      this.fanOnSchedule(settingsId);
      if (settingsId === this.settingsId) {
        this.gatewayService.server.emit('events', this.settings);
      }
    };
    this.logger.log(
      `Fan status changed to ${_settings.fan.status ? 'Active' : 'Inactive'}`,
    );
    const interval = setInterval(callback, _settings.fan.fanOffTime);
    this.schedulerRegistry.addInterval(`FanOffTimer${settingsId}`, interval);
  }

  private readonly fanOnLogger = new Logger('FanSchedule');
  async updateFanOnSchedule(
    settingsId,
    _fanOnTime: number,
  ): Promise<ISettings> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      this.settingsId,
      {
        $set: {
          fan: {
            fanOnTime: _fanOnTime,
            fanOffTime: this.settings.fan.fanOffTime,
            cycling: this.settings.fan.cycling,
            timerStarted: this.settings.fan.timerStarted,
            status: this.settings.fan.status,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    this.fanOnLogger.log(
      `Pump set to turn off in ${_fanOnTime / 1000 / 60} minutes`,
    );
    return _settings;
  }

  public async updateFanOffSchedule(
    settingsId,
    _fanOffTime: number,
  ): Promise<ISettings> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      this.settingsId,
      {
        $set: {
          fan: {
            fanOnTime: this.settings.fan.fanOnTime,
            fanOffTime: _fanOffTime,
            cycling: this.settings.fan.cycling,
            status: this.settings.fan.status,
            timerStarted: this.settings.fan.timerStarted,
          },
        },
      },
      { new: true },
    );
    this.fanOnLogger.log(
      `Fan set to turn off in ${_fanOffTime / 1000 / 60} minutes`,
    );
    this.settings = _settings;
    return _settings;
  }
  async stopFanTimer(settingsId) {
    // this.relayService.pumpOff();
    this.schedulerRegistry.doesExist('interval', `FanOnTimer${settingsId}`)
      ? this.schedulerRegistry.deleteInterval(`FanOnTimer${settingsId}`)
      : null;
    this.schedulerRegistry.doesExist('interval', `FanOffTimer${settingsId}`)
      ? this.schedulerRegistry.deleteInterval(`FanOffTimer${settingsId}`)
      : null;
    const _settings = await this.settingsModel.findByIdAndUpdate(
      settingsId,
      {
        $set: {
          fan: {
            fanOnTime: this.settings.fan.fanOnTime,
            fanOffTime: this.settings.fan.fanOffTime,
            timerStarted: '',
            status: false,
            cycling: false,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    this.logger.warn(`Fan cycle stopped`);
    return _settings;
  }
  async startFanCycle(settingsId) {
    this.settingsId = settingsId;
    this.fanOnSchedule(settingsId);
    // await this.relayService.pumpOn();
    const _settings = await this.settingsModel.findByIdAndUpdate(
      settingsId,
      {
        $set: {
          fan: {
            fanOnTime: this.settings.fan.fanOnTime,
            fanOffTime: this.settings.fan.fanOffTime,
            timerStarted: moment(new Date()).format('HH:mm:ss'),
            status: true,
            cycling: true,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    this.gatewayService.server.emit('events', this.settings);
    this.logger.warn(`Fan cycle started`);
    return _settings;
  }
  async updateExhaustStatus(settingsId, _status: boolean): Promise<ISettings> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      settingsId,
      {
        $set: {
          exhaust: {
            ffanOnTime: this.settings.exhaust.fanOnTime,
            fanOffTime: this.settings.exhaust.fanOffTime,
            timerStarted: this.settings.exhaust.timerStarted,
            status: _status,
            cycling: this.settings.exhaust.cycling,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    this.logger.log(
      `Exhaust status changed to ${
        this.settings.exhaust.status ? 'Active' : 'Inactive'
      }`,
    );
    return _settings;
  }
  async exhaustOnSchedule(settingsId) {
    this.logger.log(
      `Exhaust: ${settingsId} on schedule ${moment().format('HH:mm:ss')}`,
    );
    this.getSettings(settingsId);
    const callback = async () => {
      const _settings = await this.settingsModel.findById(settingsId);
      this.schedulerRegistry.doesExist(
        'interval',
        `ExhaustOnTimer${settingsId}`,
      )
        ? this.schedulerRegistry.deleteInterval(`ExhaustOnTimer${settingsId}`)
        : null;
      this.exhaustOffSchedule(settingsId);
      await this.settingsModel.findByIdAndUpdate(
        settingsId,
        {
          $set: {
            exhaust: {
              fanOnTime: _settings.exhaust.fanOnTime,
              fanOffTime: _settings.exhaust.fanOffTime,
              status: false,
              cycling: true,
              timerStarted: moment(new Date()).format('HH:mm:ss'),
            },
          },
        },
        { new: true },
      );
      // this.relayService.pumpOff();
      if (settingsId === this.settingsId) {
        this.gatewayService.server.emit('events', _settings);
      }
      this.fanOnLogger.log(
        `Exhaust set to ${this.settings.exhaust.fanOnTime / 1000 / 60} minutes`,
      );
    };

    const _settings = await this.settingsModel.findById(settingsId);

    const interval = setInterval(callback, _settings.fan.fanOnTime);
    this.schedulerRegistry.addInterval(`ExhaustOnTimer${settingsId}`, interval);
  }

  async exhaustOffSchedule(settingsId) {
    this.logger.log(
      `${settingsId} exhaust off schedule ${moment(new Date()).format(
        'HH:mm:ss',
      )}`,
    );
    const _settings = await this.settingsModel.findById(settingsId);
    this.getSettings(settingsId);

    const callback = async () => {
      this.logger.warn(`Interval ${'ExhaustOffTimer'} executing`);
      this.schedulerRegistry.doesExist(
        'interval',
        `ExhaustOffTimer${settingsId}`,
      )
        ? this.schedulerRegistry.deleteInterval(`ExhaustOffTimer${settingsId}`)
        : null;
      // this.relayService.pumpOn();
      await this.settingsModel.findByIdAndUpdate(
        settingsId,
        {
          $set: {
            exhaust: {
              fanOnTime: _settings.exhaust.fanOnTime,
              fanOffTime: _settings.exhaust.fanOffTime,
              status: true,
              cycling: true,
              timerStarted: moment(new Date()).format('HH:mm:ss'),
            },
          },
        },
        { new: true },
      );
      this.exhaustOnSchedule(settingsId);
      if (settingsId === this.settingsId) {
        this.gatewayService.server.emit('events', this.settings);
      }
    };
    this.logger.log(
      `exhaust status changed to ${
        _settings.exhaust.status ? 'Active' : 'Inactive'
      }`,
    );
    const interval = setInterval(callback, _settings.exhaust.fanOffTime);
    this.schedulerRegistry.addInterval(
      `ExhaustOffTimer${settingsId}`,
      interval,
    );
  }

  async updateExhaustOnSchedule(
    settingsId,
    _fanOnTime: number,
  ): Promise<ISettings> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      this.settingsId,
      {
        $set: {
          exhaust: {
            fanOnTime: _fanOnTime,
            fanOffTime: this.settings.exhaust.fanOffTime,
            cycling: this.settings.exhaust.cycling,
            timerStarted: this.settings.exhaust.timerStarted,
            status: this.settings.exhaust.status,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    this.fanOnLogger.log(
      `Exhaust set to turn off in ${_fanOnTime / 1000 / 60} minutes`,
    );
    return _settings;
  }

  public async updateExhaustOffSchedule(
    settingsId,
    _fanOffTime: number,
  ): Promise<ISettings> {
    const _settings = await this.settingsModel.findByIdAndUpdate(
      this.settingsId,
      {
        $set: {
          exhaust: {
            fanOnTime: this.settings.exhaust.fanOnTime,
            fanOffTime: _fanOffTime,
            cycling: this.settings.exhaust.cycling,
            status: this.settings.exhaust.status,
            timerStarted: this.settings.exhaust.timerStarted,
          },
        },
      },
      { new: true },
    );
    this.fanOnLogger.log(
      `Fan set to turn off in ${_fanOffTime / 1000 / 60} minutes`,
    );
    this.settings = _settings;
    return _settings;
  }
  async stopExhaustTimer(settingsId) {
    // this.relayService.pumpOff();
    this.schedulerRegistry.doesExist('interval', `ExhaustOnTimer${settingsId}`)
      ? this.schedulerRegistry.deleteInterval(`ExhaustOnTimer${settingsId}`)
      : null;
    this.schedulerRegistry.doesExist('interval', `ExhaustOffTimer${settingsId}`)
      ? this.schedulerRegistry.deleteInterval(`ExhaustOffTimer${settingsId}`)
      : null;
    const _settings = await this.settingsModel.findByIdAndUpdate(
      settingsId,
      {
        $set: {
          exhaust: {
            fanOnTime: this.settings.exhaust.fanOnTime,
            fanOffTime: this.settings.exhaust.fanOffTime,
            timerStarted: '',
            status: false,
            cycling: false,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    this.logger.warn(`Fan cycle stopped`);
    return _settings;
  }
  async startExhaustCycle(settingsId) {
    this.settingsId = settingsId;
    this.exhaustOnSchedule(settingsId);
    // await this.relayService.pumpOn();
    const _settings = await this.settingsModel.findByIdAndUpdate(
      settingsId,
      {
        $set: {
          exhaust: {
            fanOnTime: this.settings.exhaust.fanOnTime,
            fanOffTime: this.settings.exhaust.fanOffTime,
            timerStarted: moment(new Date()).format('HH:mm:ss'),
            status: true,
            cycling: true,
          },
        },
      },
      { new: true },
    );
    this.settings = _settings;
    this.gatewayService.server.emit('events', this.settings);
    this.logger.warn(`Exhaust cycle started`);
    return _settings;
  }
  @Cron(CronExpression.EVERY_SECOND)
  async handleLightSchedule() {
    const _settings = await this.settingsModel.findById(this.settingsId);
    const allSettings = await this.settingsModel.find();

    allSettings.forEach(async (settings, i) => {
      if (
        settings.light.lightOffTime == moment().format('HH:mm') &&
        settings.light.status == true
      ) {
        await this.settingsModel.findByIdAndUpdate(
          settings.id,
          {
            $set: {
              light: {
                lightOnTime: settings.light.lightOnTime,
                lightOffTime: settings.light.lightOffTime,
                status: false,
              },
            },
          },
          { new: true },
        );
        this.relayService.lightOff();
      }
      if (
        settings.light.lightOnTime == moment().format('HH:mm') &&
        settings.light.status == false
      ) {
        await this.settingsModel.findByIdAndUpdate(
          settings.id,
          {
            $set: {
              light: {
                lightOnTime: this.settings.light.lightOnTime,
                lightOffTime: this.settings.light.lightOffTime,
                status: true,
              },
            },
          },
          { new: true },
        );
        this.relayService.lightOn();
      }
    });

    const start = moment(_settings.pump.timerStarted, 'HH:mm:ss');
    const end = moment(_settings.pump.timerStarted, 'HH:mm:ss').add(
      _settings.pump.status == true
        ? _settings.pump.pumpOnTime
        : _settings.pump.pumpOffTime,
      'milliseconds',
    );
    const now = moment();
    const durationInMilliseconds = moment
      .duration(end.diff(start))
      .asMilliseconds();

    //  this.logger.log(`Light on time: ${this.settings.light.lightOnTime} Light off time: ${this.settings.light.lightOffTime} Current time: ${moment().format('HH:mm')}`)
    const t1 = moment(_settings.light.lightOffTime, 'HH:mm');
    const t2 = moment(_settings.light.lightOnTime, 'HH:mm');

    const duration: any = moment.duration(t1.diff(t2));
    const remainingDuration: any = moment.duration(
      _settings.light.status == true ? t1.diff(moment()) : t2.diff(moment()),
    );
    const completedPercentage: any =
      ((duration - remainingDuration.asSeconds() < 0
        ? remainingDuration.add(1, 'days')
        : remainingDuration) /
        duration) *
      100;

    this.gatewayService.server.emit('lightTimer', {
      id: _settings.id,
      status: _settings.light.status,
      totalHours: duration.hours(),
      totalMinutes: duration.minutes(),
      totalSeconds: duration.seconds(),
      remainingHours: remainingDuration.hours(),
      remainingMinutes: remainingDuration.minutes(),
      remainingSeconds: remainingDuration.seconds(),
      completedPercentage: completedPercentage,
      remainingTime: t1.fromNow(),
    });
  }

  @Cron(CronExpression.EVERY_SECOND, {
    name: `pumpTimer`,
  })
  async handlePumpSchedule() {
    const _settings = await this.settingsModel.findById(this.getSettingsId());

    const start = moment(_settings.pump.timerStarted, 'HH:mm:ss');
    const end = moment(_settings.pump.timerStarted, 'HH:mm:ss').add(
      _settings.pump.status == true
        ? _settings.pump.pumpOnTime
        : _settings.pump.pumpOffTime,
      'milliseconds',
    );
    const now = moment();
    const durationInMilliseconds = moment
      .duration(end.diff(start))
      .asMilliseconds();
    const timeRemaining = moment
      .utc(moment(end, 'HH:mm:ss').diff(now))
      .format('HH:mm:ss');
    const percentageCompleted =
      (durationInMilliseconds -
        moment.duration(end.diff(now)).asMilliseconds()) /
      durationInMilliseconds;
    this.gatewayService.server.emit('pumpTimer', {
      id: _settings.id,
      totalHours: moment.duration(durationInMilliseconds).hours(),
      status: _settings.pump.status,
      totalMinutes: moment.duration(durationInMilliseconds).minutes(),
      totalSeconds: moment.duration(durationInMilliseconds).seconds(),
      remainingHours: moment
        .duration(moment(end, 'HH:mm:ss').diff(now))
        .hours(),
      remainingMinutes: moment
        .duration(moment(end, 'HH:mm:ss').diff(now))
        .minutes(),
      remainingSeconds: moment
        .duration(moment(end, 'HH:mm:ss').diff(now))
        .seconds(),
      completedPercentage: percentageCompleted,
      remainingTime: timeRemaining,
    });
  }
  @Cron(CronExpression.EVERY_SECOND, {
    name: `fanTimer`,
  })
  async handleFanSchedule() {
    const _settings = await this.settingsModel.findById(this.settingsId);

    const start = moment(_settings.fan.timerStarted, 'HH:mm:ss');
    const end = moment(_settings.fan.timerStarted, 'HH:mm:ss').add(
      _settings.fan.status == true
        ? _settings.fan.fanOnTime
        : _settings.fan.fanOffTime,
      'milliseconds',
    );
    const now = moment();
    const durationInMilliseconds = moment
      .duration(end.diff(start))
      .asMilliseconds();
    const timeRemaining = moment
      .utc(moment(end, 'HH:mm:ss').diff(now))
      .format('HH:mm:ss');
    const percentageCompleted =
      (durationInMilliseconds -
        moment.duration(end.diff(now)).asMilliseconds()) /
      durationInMilliseconds;
    this.gatewayService.server.emit('fanTimer', {
      id: _settings.id,
      totalHours: moment.duration(durationInMilliseconds).hours(),
      status: _settings.fan.status,
      totalMinutes: moment.duration(durationInMilliseconds).minutes(),
      totalSeconds: moment.duration(durationInMilliseconds).seconds(),
      remainingHours: moment
        .duration(moment(end, 'HH:mm:ss').diff(now))
        .hours(),
      remainingMinutes: moment
        .duration(moment(end, 'HH:mm:ss').diff(now))
        .minutes(),
      remainingSeconds: moment
        .duration(moment(end, 'HH:mm:ss').diff(now))
        .seconds(),
      completedPercentage: percentageCompleted,
      remainingTime: timeRemaining,
    });
  }
  @Cron(CronExpression.EVERY_SECOND, {
    name: `exhaustTimer`,
  })
  async handleExhaustSchedule() {
    const _settings = await this.settingsModel.findById(this.settingsId);

    const start = moment(_settings.exhaust.timerStarted, 'HH:mm:ss');
    const end = moment(_settings.exhaust.timerStarted, 'HH:mm:ss').add(
      _settings.exhaust.status == true
        ? _settings.exhaust.fanOnTime
        : _settings.exhaust.fanOffTime,
      'milliseconds',
    );
    const now = moment();
    const durationInMilliseconds = moment
      .duration(end.diff(start))
      .asMilliseconds();
    const timeRemaining = moment
      .utc(moment(end, 'HH:mm:ss').diff(now))
      .format('HH:mm:ss');
    const percentageCompleted =
      (durationInMilliseconds -
        moment.duration(end.diff(now)).asMilliseconds()) /
      durationInMilliseconds;
    this.gatewayService.server.emit('exhaustTimer', {
      id: _settings.id,
      totalHours: moment.duration(durationInMilliseconds).hours(),
      status: _settings.exhaust.status,
      totalMinutes: moment.duration(durationInMilliseconds).minutes(),
      totalSeconds: moment.duration(durationInMilliseconds).seconds(),
      remainingHours: moment
        .duration(moment(end, 'HH:mm:ss').diff(now))
        .hours(),
      remainingMinutes: moment
        .duration(moment(end, 'HH:mm:ss').diff(now))
        .minutes(),
      remainingSeconds: moment
        .duration(moment(end, 'HH:mm:ss').diff(now))
        .seconds(),
      completedPercentage: percentageCompleted,
      remainingTime: timeRemaining,
    });
  }
}
