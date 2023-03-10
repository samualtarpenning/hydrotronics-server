import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const TemperatureSchema = new Schema({
  date: Date,
  settingsId: String,
  growSpace: {
    temperature: Number,
    humidity: Number,
    vpd: Number,
    ppm: Number,
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
