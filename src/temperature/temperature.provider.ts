import { Connection } from 'mongoose';
import { TemperatureSchema } from './temperature.schema';

export const temperatureProviders = [
  {
    provide: 'TEMPERATURE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Temperature', TemperatureSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
