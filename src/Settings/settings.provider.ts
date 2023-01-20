import { Connection } from 'mongoose';
import { SettingsSchema } from './settings.schema';

export const settingsProviders = [
  {
    provide: 'SETTINGS_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Settings', SettingsSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
