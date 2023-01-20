import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(
        'mongodb+srv://sam_wise89:fordmotor@serverlessinstance0.hvicb.mongodb.net/?retryWrites=true&w=majority',
      ),
    // mongoose.connect('mongodb+srv://sam_wise89:fordmotor@cluster0.dybcrol.mongodb.net/?retryWrites=true&w=majority')
  },
];
