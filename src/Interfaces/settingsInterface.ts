export interface ILight {
  status: boolean;
  lightOnTime: string;
  lightOffTime: string;
}

export interface IPump {
  status: boolean;
  pumpOnTime: number;
  pumpOffTime: number;
  timerStarted: string;
  cycling: boolean;
}

export interface IFan {
  status: boolean;
  fanOnTime: number;
  fanOffTime: number;
  timerStarted: string;
  cycling: boolean;
}

export interface IExhaust {
  status: boolean;
  fanOnTime: number;
  fanOffTime: number;
  timerStarted: string;
  cycling: boolean;
}

export interface ISettings {
  id: string;
  light: ILight;
  pump: IPump;
  fan: IFan;
  exhaust: IExhaust;
  connection: string;
}
