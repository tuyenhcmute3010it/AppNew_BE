import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
export class UpdateUserDto extends OmitType(CreateUserDto, [
  'password',
  'email',
] as const) {
  @IsMongoId()
  _id: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  phone: string;
}
