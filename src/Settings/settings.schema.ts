import * as mongoose from 'mongoose';

export const SettingsSchema = new mongoose.Schema({
  light: {
    status: Boolean,
    lightOnTime: String,
    lightOffTime: String,
  },
  pump: {
    status: Boolean,
    pumpOnTime: Number,
    pumpOffTime: Number,
    cycling: Boolean,
    timerStarted: String,
  },
  fan: {
    status: Boolean,
    fanOnTime: Number,
    fanOffTime: Number,
    cycling: Boolean,
    timerStarted: String,
  },
  exhaust: {
    status: Boolean,
    fanOnTime: Number,
    fanOffTime: Number,
    cycling: Boolean,
    timerStarted: String,
  },
});
