import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  size: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  color: string;

  @IsInt()
  @IsPositive()
  stock: number;
}
