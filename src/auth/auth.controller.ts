import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPassword,
  RegisterUserDto,
  VerifyCode,
  VerifyEmail,
} from 'src/users/dto/create-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request as RequestExpress, Response, response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { IUser } from 'src/users/users.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // register
  @Public()
  @Post('/register')
  @ResponseMessage('Register a user')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }
  @Public()
  @ResponseMessage('Register a new user')
  @Post('/verify-code')
  verifyCode(@Body() verifyCode: VerifyCode) {
    return this.authService.verifyCode(verifyCode);
  }

  @Public()
  @ResponseMessage('Register a new user')
  @Post('/verify-email')
  verifyEmail(@Body() verifyEmail: VerifyEmail) {
    return this.authService.verifyEmail(verifyEmail);
  }
  @Public()
  @ResponseMessage('Forgot Password')
  @Post('/forgot-password')
  forgotPassword(@Body() forgotPassword: ForgotPassword) {
    return this.authService.forgotPassword(forgotPassword);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  // @Throttle(5, 60)
  // @ApiBody({ type: UserLoginDto })
  @ResponseMessage('User Login')
  @Post('/login')
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('/account')
  @ResponseMessage('Get user information')
  async getAccount(@User() user: IUser) {
    return this.authService.getAccount(user);
  }
}
