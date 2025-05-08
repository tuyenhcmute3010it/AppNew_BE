import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import e from 'express';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name Khong duoc de trong' })
  name: string;

  @IsEmail(
    {},
    {
      message: 'Email Khong Dung Dinh Dang',
    },
  )
  @IsNotEmpty({
    message: 'Email Khong duoc de trong',
  })
  email: string;

  @IsNotEmpty({
    message: 'Password Khong duoc de trong',
  })
  password: string;
  phone: string;
}
export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name Khong duoc de trong' })
  name: string;

  @IsEmail(
    {},
    {
      message: 'Email Khong Dung Dinh Dang',
    },
  )
  @IsNotEmpty({
    message: 'Email Khong duoc de trong',
  })
  email: string;

  @IsNotEmpty({
    message: 'Password Khong duoc de trong',
  })
  password: string;
  phone: string;
}
export class VerifyCode {
  @IsEmail(
    {},
    {
      message: 'Email Khong Dung Dinh Dang',
    },
  )
  @IsNotEmpty({
    message: 'Email Khong duoc de trong',
  })
  email: string;
  @IsNotEmpty({
    message: 'Code Khong duoc de trong',
  })
  code: string;
}
export class VerifyEmail {
  @IsEmail(
    {},
    {
      message: 'Email Khong Dung Dinh Dang',
    },
  )
  @IsNotEmpty({
    message: 'Email Khong duoc de trong',
  })
  email: string;
}
export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'mimicute', description: 'username' })
  readonly username: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    description: 'password',
  })
  readonly password: string;
}
export class UpdatePassword {
  @IsNotEmpty()
  currentPassword: string;
  @IsNotEmpty()
  newPassword: string;
}
export class ForgotPassword {
  @IsNotEmpty()
  code: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
