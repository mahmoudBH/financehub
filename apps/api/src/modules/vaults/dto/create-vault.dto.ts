import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVaultDto {
  @ApiProperty({ example: 'Summer Vacation' })
  @IsString()
  name: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(1)
  targetAmount: number;

  @ApiPropertyOptional({ example: 'indigo' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'plane' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isRoundUpEnabled?: boolean;

  @ApiProperty({ example: 'acc-uuid' })
  @IsString()
  accountId: string;
}
