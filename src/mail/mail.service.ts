import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async handleSendEmail(email: string) {
    console.log('>>> mail', email);
    const user = await this.userModel.findOne({
      email: email,
    });
    if (user) {
      await this.mailerService.sendMail({
        to: email,
        from: '"Support Team" <tuyenbest1234@gmail.com>', // override default from
        subject: 'Welcome to Nice App! Confirm your Email',
        template: 'verifyCode',

        context: {
          receiver: user.name,
          email: user.email,
          code: user.code,
          time: user.createdAt,
        },
      });
      return {};
    }
    //todo
    //build template
  }
}
