"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureService = void 0;
const common_1 = require("@nestjs/common");
const temperaturenterface_1 = require("../Interfaces/temperaturenterface");
const mongoose_1 = require("mongoose");
const schedule_1 = require("@nestjs/schedule");
const moment = require("moment");
const axios_1 = require("@nestjs/axios");
let TemperatureService = class TemperatureService {
    constructor(temperatureModel, httpService) {
        this.temperatureModel = temperatureModel;
        this.httpService = httpService;
     
    }
    async findAll() {
        return this.temperatureModel.find().exec();
    }
    async getCurrentTemp() {
        const loggedTemp = {
            timestamp: moment().format(),
            temperature: (this.t * 9) / 5 + 32,
            humidity: this.h,
        };
        return loggedTemp;
    }
    async findAllByHour() {
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
    async updateTemp() {
        await this.httpService
            .get('http://192.168.1.4/getTemperature')
            .subscribe((res) => {
            this.t = parseFloat(res.data);
            console.log(this.t);
        });
        await this.httpService
            .get('http://192.168.1.4/getRelativeHumidity')
            .subscribe((res) => {
            this.h = parseFloat(res.data);
            console.log(this.h);
        });
    }
    async handleCron() {
        const loggedTemp = new this.temperatureModel({
            timestamp: moment().format(),
            temperature: (this.t * 9) / 5 + 32,
            humidity: this.h,
        });
        this.logger.debug(`temp: ${loggedTemp.temperature}
       timeStamp: ${loggedTemp.timestamp}
       humidity: ${loggedTemp.humidity}`);
    }
};
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemperatureService.prototype, "updateTemp", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2PM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemperatureService.prototype, "handleCron", null);
TemperatureService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('TEMPERATURE_MODEL')),
    __metadata("design:paramtypes", [mongoose_1.Model,
        axios_1.HttpService])
], TemperatureService);
exports.TemperatureService = TemperatureService;
//# sourceMappingURL=temperature.service.js.map