import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const TemperatureSchema = new Schema({
  growSpace: {
    date: Date,
    temperature: Number,
    humidity: Number,
    vpd: Number,
  },
  weather: {
    timestamp: String,
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
