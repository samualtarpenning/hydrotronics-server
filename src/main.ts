import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('./key.pem'),
  //   cert: fs.readFileSync('./cert.pem'),
  // };
  process.on('uncaughtException', function (error) {
    console.log(error.stack);
  });

  const app = await NestFactory.create(AppModule);
  await app.enableCors();
  await app.listen(3002);
}
bootstrap();
