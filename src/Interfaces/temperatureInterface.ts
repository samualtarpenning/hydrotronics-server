import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export interface ITemperature {
  _id: ObjectId;
  createdAt: Date;
  zoneId: string;
  growSpace: IGrowSpace;
  weather: IWeather;
}

export interface IGrowSpace {
  temperature: number;
  humidity: number;
  vpd: number;
}

export interface IWeather {
  temperature: number;
  feelsLike: number;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  cloudCover: number;
  sunset: string;
  sunrise: string;
  weather: string;
  weatherDescription: string;
  weatherIcon: string;
}

export const TemperatureSchema = new Schema({
  _id: String,
  createdAt: { type: Date, default: Date.now },
  zoneId: String,
  growSpace: {
    temperature: Number,
    humidity: Number,
    vpd: Number,
  },
  weather: {
    temperature: Number,
    feelsLike: Number,
    maxTemp: Number,
    minTemp: Number,
    humidity: Number,
    windSpeed: Number,
    windDirection: Number,
    pressure: Number,
    cloudCover: Number,
    sunset: String,
    sunrise: String,
    weather: String,
    weatherDescription: String,
    weatherIcon: String,
  },
});
