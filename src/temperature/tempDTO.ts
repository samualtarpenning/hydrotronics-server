import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class tempDTO {
  @IsString()
  @ApiProperty({ type: String, description: 'timestamp' })
  readonly timestamp: Date;

  @IsNumber()
  @ApiProperty({ type: Number, description: 'temperature' })
  readonly temperature: number;

  @IsNumber()
  @ApiProperty({ type: Number, description: 'humidity' })
  readonly humidity: number;
}
