import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ForgotPassword,
  RegisterUserDto,
  VerifyCode,
  VerifyEmail,
} from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { MailService } from 'src/mail/mail.service';
import { IUser } from 'src/users/users.interface';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    let user = await this.usersService.register(registerUserDto);
    this.mailService.handleSendEmail(registerUserDto.email);
    return {
      _id: user._id,
      timestamp: user.codeExpired, // Thêm 5 phút (5 phút * 60 giây * 1000 ms)
    };
  }
  async verifyCode(verifyCode: VerifyCode) {
    let user = await this.usersService.verifyCode(verifyCode);

    return user;
  }
  async verifyEmail(verifyEmail: VerifyEmail) {
    let user = await this.usersService.verifyEmail(verifyEmail);
    this.mailService.handleSendEmail(verifyEmail.email);
    return user;
  }
  /// login
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUserName(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid === true) {
        if (user.status === false) {
          throw new BadRequestException(
            'User are not already active , Pls Active Account',
          );
        }
        const objUser = {
          ...user.toObject(),
        };
        return objUser;
      }
    }
    return null;
  }
  //
  async login(user: IUser, response: Response) {
    const { _id, name, email, avatar } = user;
    const payload = {
      sub: 'token login',
      iss: 'form server',
      _id,
      name,
      email,
      role: user.role || 'User', // Include role
    };
    const refreshToken = this.createRefreshToken(payload);
    // update user with refresh token
    await this.usersService.updateUserToken(refreshToken, _id);

    // set refresh_token as cookies
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
    return {
      user: {
        _id,
        name,
        email,
        avatar,
      },
      access_token: this.jwtService.sign(payload),
      refreshToken,
    };
  }
  async getAccount(user: IUser) {
    let userDb = await this.userModel.findOne({ _id: user._id });
    return {
      user: {
        _id: userDb._id,
        name: userDb.name,
        phone: userDb.phone,
        avatar: userDb.avatar,
        email: userDb.email,
      },
    };
  }
  createRefreshToken = (payload) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
    return refreshToken;
  };
  async forgotPassword(forgotPassword: ForgotPassword) {
    const userDB = await this.userModel.findOne({
      email: forgotPassword.email,
    });
    if (forgotPassword.code === userDB.code) {
      this.usersService.forgotPassword(forgotPassword);
    } else {
      throw new BadRequestException('Code not correct');
    }
    return 'Update Password Success';
  }
}
