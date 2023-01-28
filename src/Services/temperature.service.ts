import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITemperature, IWeather } from 'src/Interfaces/temperatureInterface';
import mongoose, { Model, mongo } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { HttpService } from '@nestjs/axios';
import { SettingsGateway } from 'src/Gateways/settings.gateway';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class TemperatureService {
  t = [];
  h = [];
  vpd = [];
  ppm =[];
  logged: boolean;
  weather: IWeather;
  temperatureLogModel: any;
  connections = [
    "http://192.168.1.4", "http://192.168.1.2"
  ]

  constructor(
    @Inject('TEMPERATURE_MODEL')
    @InjectModel('Temperature')
    private readonly temperatureModel: Model<ITemperature>,
    private readonly httpService: HttpService,
    private gatewayService: SettingsGateway,
  ) {}
  private readonly logger = new Logger('TemperatureService');
  async findAll(): Promise<ITemperature[]> {
    return this.temperatureModel.find().exec();
  }
  async getCurrentTemperature(): Promise<any[]> {
  
    const loggedTemp = [{
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(moment().format()),
      settingsId: '639e769b119143ff3ff6b267',
     
        temperature: this.t[0],
        humidity: this.h[0],
        vpd: this.vpd[0],
        ppm: this.ppm[0],
   weather: { ...this.weather,}
     
    }, 
  {
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(moment().format()),
    settingsId: '63c2eccddc6a55471cab3b69',
   
      temperature: this.t[1],
      humidity: this.h[1],
      vpd: this.vpd[1],
      ppm: this.ppm[1],
    weather: { ...this.weather,}

  }
  ] 
    return loggedTemp;
  }

  async getVpd() {
    // get vpd from t and h
    await this.httpService.get('http://192.168.1.4/getVpd').subscribe((res) => {
      this.vpd = [1.22, 1.24];
      // console.log(this.t);
    });
    return this.vpd;
  }

  async findAllByHour(): Promise<ITemperature[]> {
    return this.temperatureModel.aggregate([
      {
        $match: {
          timestamp: {
            $gt: new Date(moment().subtract(1, 'days').format()),
            $lte: new Date(),
          },
        },
      },
      {
        $group: {
          _id: {
            $substr: ['$timestamp', 11, 2],
          },
          avgTemp: {
            $avg: '$temperature',
          },
        },
      },
      {
        $addFields: {
          hour: [
            '0000',
            '0101',
            '0202',
            '0303',
            '0404',
            '0505',
            '0606',
            '0707',
            '0808',
            '0909',
            '1010',
            '1111',
            '1212',
            '1301',
            '1402',
            '1503',
            '1604',
            '1705',
            '1806',
            '1907',
            '2008',
            '2109',
            '2210',
            '2311',
          ],
        },
      },
      {
        $unwind: '$hour',
      },
      {
        $project: {
          _id: 0,
          hour: 1,
          avgTemp: {
            $cond: [
              {
                $eq: [
                  {
                    $substr: ['$hour', 0, 2],
                  },
                  '$_id',
                ],
              },
              '$avgTemp',
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$hour',
          avgTemp: { $avg: '$avgTemp' },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
          hour: {
            $concat: [
              {
                $substr: ['$_id', 2, 2],
              },
              {
                $cond: [
                  {
                    $gt: [
                      {
                        $substr: ['$_id', 0, 2],
                      },
                      '12',
                    ],
                  },
                  ' PM',
                  ' AM',
                ],
              },
            ],
          },
          avgTemp: '$avgTemp',
        },
      },
    ]);
  }
  @Cron(CronExpression.EVERY_MINUTE)
  async updateTemp() {
  
    this.connections.forEach(async (connection, i) => {
    await this.httpService
      .get(connection + '/getTemperature')
      .subscribe((res) => {
        this.t[i] = (parseFloat(res.data)  * 9) / 5 + 32;
        
      });

    await this.httpService
      .get(connection + '/getRelativeHumidity')
      .subscribe((res) => {
        this.h[i] = parseFloat(res.data);
      });

    await this.httpService.get(connection + '/getVpd').subscribe((res) => {
   
      this.vpd[i] = parseFloat(res.data);
      // console.log(this.t);
    });
    await this.httpService.get(connection + '/ppm').subscribe((res) => {
      this.ppm[i] = parseFloat(res.data);
      // console.log(this.t);
    });
  })

    this.gatewayService.server.emit('temperature',  [{
   
      createdAt: new Date(moment().format()),
      settingsId: '639e769b119143ff3ff6b267',
        temperature: this.t[0],
        humidity: this.h[0],
        vpd: this.vpd[0],
        ppm: this.ppm[0],
        weather: { ...this.weather,}
    }, 
  {
  
    settingsId: '63c2eccddc6a55471cab3b69',
      temperature: this.t[1],
      humidity: this.h[1],
      vpd: this.vpd[1],
      ppm: this.ppm[1],
      weather: {
    ...this.weather,
      }
  }
  ]
  );
  

    this.gatewayService.server.emit('weather', {
      weather: this.weather,
    });
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    await this.httpService
      .get(
        'https://api.openweathermap.org/data/2.5/weather?lat=39.741714&lon=-94.2676745&appid=aa9db6c29fca864284c0d5657f2d574f',
      )
      .subscribe((res) => {
        // Set the time zone for the moment object

        const tempF = ((res.data.main.temp - 273.15) * 9) / 5 + 32;
        const feelsLikeF = ((res.data.main.feels_like - 273.15) * 9) / 5 + 32;
        const tempMinF = ((res.data.main.temp_min - 273.15) * 9) / 5 + 32;
        const tempMaxF = ((res.data.main.temp_max - 273.15) * 9) / 5 + 32;
        const sunriseMomentObject = moment.unix(res.data.sys.sunrise);

        const sunsetMomentObject = moment.unix(res.data.sys.sunset);
        const timeZone = 'America/Chicago';
        sunriseMomentObject.tz(timeZone);
        sunsetMomentObject.tz(timeZone);

        const sunset = sunsetMomentObject.format('h:mm:ss A z');
        const sunrise = sunriseMomentObject.format('h:mm:ss A z');

        this.weather = {
          temperature: tempF,
          feelsLike: feelsLikeF,
          maxTemp: tempMaxF,
          minTemp: tempMinF,
          humidity: res.data.main.humidity,
          windSpeed: res.data.wind.speed,
          windDirection: res.data.wind.deg,
          pressure: res.data.main.pressure,
          cloudCover: res.data.clouds.all,
          sunset: sunset,
          sunrise: sunrise,
          weather: res.data.weather[0].main,
          weatherDescription: res.data.weather[0].description,
          weatherIcon: res.data.weather[0].icon,
        };
      });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async create(): Promise<ITemperature> {
    const createdTemperatureLog1 = new this.temperatureModel({
      settingsId: '639e769b119143ff3ff6b267',
      createdAt: new Date(),
      growSpace: {
        temperature: this.t[0],
        humidity: this.h[0],
        vpd: this.vpd[0],
        ppm: this.ppm[0],
      },
      weather: {
        temperature: this.weather.temperature,
        feelsLike: this.weather.feelsLike,
        maxTemp: this.weather.maxTemp,
        minTemp: this.weather.minTemp,
        humidity: this.weather.humidity,
        windSpeed: this.weather.windSpeed,
        windDirection: this.weather.windDirection,
        pressure: this.weather.pressure,
        cloudCover: this.weather.cloudCover,
        sunset: this.weather.sunset,
        sunrise: this.weather.sunrise,
        weather: this.weather.weather,
        weatherDescription: this.weather.weatherDescription,
        weatherIcon: this.weather.weatherIcon,
      },
    });
    const createdTemperatureLog2 = new this.temperatureModel({ 
      settingsId: '63c2eccddc6a55471cab3b69',
      createdAt: new Date(),
      growSpace: {
        temperature: this.t[1],
        humidity: this.h[1],
        vpd: this.vpd[1],
        ppm: this.ppm[1],
      },
      weather: {
        temperature: this.weather.temperature,
        feelsLike: this.weather.feelsLike,
        maxTemp: this.weather.maxTemp,
        minTemp: this.weather.minTemp,
        humidity: this.weather.humidity,
        windSpeed: this.weather.windSpeed,
        windDirection: this.weather.windDirection,
        pressure: this.weather.pressure,
        cloudCover: this.weather.cloudCover,
        sunset: this.weather.sunset,
        sunrise: this.weather.sunrise,
        weather: this.weather.weather,
        weatherDescription: this.weather.weatherDescription,
        weatherIcon: this.weather.weatherIcon,
      },
    });
    await createdTemperatureLog1.save();

    await createdTemperatureLog2.save();

    return createdTemperatureLog1;
  }
  @Cron(CronExpression.EVERY_HOUR)
  async log() {

    this.logger.log(
      'Zone 1',
      `System Temperature: ${this.t[0]}°F`,
      `System Humidity: ${this.h[0]}%`,
      `System VPD: ${this.vpd[0]}kPa`,
      `System PPM: ${this.ppm[0]}ppm`,
    );
    this.logger.log(
      'Zone 2',
      `System Temperature: ${this.t[1]}°F`,
      `System Humidity: ${this.h[1]}%`,
      `System VPD: ${this.vpd[1]}kPa`,
      `System PPM: ${this.ppm[1]}ppm`,
    );
    this.logger.log(
      'Weather',
      `Weather Temperature: ${this.weather.temperature.toFixed(2)}°F`,
      `Weather Humidity: ${this.weather.humidity.toFixed(2)}%`,
      `Weather: ${this.weather.weatherDescription}`,
      `sunrise: ${this.weather.sunrise}`,
      `sunset: ${this.weather.sunset}`,
    );
  }
}
