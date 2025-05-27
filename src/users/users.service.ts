import { BadRequestException, Get, Injectable, Param } from '@nestjs/common';
import {
  CreateUserDto,
  ForgotPassword,
  RegisterUserDto,
  UpdatePassword,
  VerifyCode,
  VerifyEmail,
} from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { codeVerify } from 'src/utils/utils';
import { ConfigService } from '@nestjs/config';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { IUser } from './users.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    private configService: ConfigService,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  // @Public()
  // findAll() {
  //   return this.userModel.find();
  // }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.userModel
      .find(filter)
      .select('-password')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not Found User';
    }

    // Exclude the password field using `.select()`
    const user = await this.userModel.findOne({ _id: id }).select('-password');
    return user;
  }

  async update(updateUserDto: UpdateUserDto) {
    console.log('update', updateUserDto);
    await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
    return {
      user: {
        ...updateUserDto,
      },
    };
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };
  async register(registerUserDto: RegisterUserDto) {
    const isExist = await this.userModel.findOne({
      email: registerUserDto.email,
    });
    if (isExist) {
      throw new BadRequestException(
        `Email ${registerUserDto.email} is already exits in system , Pls use another email`,
      );
    }

    const hashPassword = this.getHashPassword(registerUserDto.password);
    const code = codeVerify();
    let user = await this.userModel.create({
      ...registerUserDto,
      phone: '',
      status: false,
      codeExpired: Date.now() + 5 * 60 * 1000,
      code: code,
      password: hashPassword,
      avatar: 'default-avatar.jpg',
    });
    return {
      _id: user._id,
      createdAt: user.createdAt,
      codeExpired: user.codeExpired,
    };
  }
  async verifyCode(verifyCode: VerifyCode) {
    let userCheck = await this.userModel.findOne({
      email: verifyCode.email,
    });
    if (userCheck?.code !== verifyCode.code) {
      console.log(verifyCode.code);

      throw new BadRequestException(
        `Code ${verifyCode.code} is not correct, pls try again`,
      );
    }
    if (userCheck.codeExpired.getTime() < Date.now()) {
      throw new BadRequestException(
        `Verification code has expired, please request a new one.`,
      );
    }
    return await this.userModel.updateOne(
      { _id: userCheck._id },
      {
        status: true,
      },
    );
  }

  async verifyEmail(verifyEmail: VerifyEmail) {
    const userCheck = await this.userModel.findOne({
      email: verifyEmail.email,
    });
    const code = codeVerify();
    // Cập nhật code cho user
    const updateResult = await this.userModel.updateOne(
      { _id: userCheck?._id },
      {
        ...verifyEmail,
        code: code,
        codeExpired: Date.now() + 5 * 60 * 1000,
      },
    );

    // Trả về thông tin đơn giản hoặc code
    return {
      message: 'Verification code updated',
      updateResult,
    };
  }

  findOneByUserName(username: string) {
    return this.userModel.findOne({
      email: username,
    });
  }

  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword); // true
  }

  async updatePassword(updatePassword: UpdatePassword, user: IUser) {
    const userDB = await this.userModel.findOne({
      _id: user._id,
    });

    if (!userDB) {
      throw new BadRequestException('User not found');
    }

    // Compare the plain-text current password with the stored hashed password
    const isPasswordValid = compareSync(
      updatePassword.currentPassword,
      userDB.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is not correct');
    }

    // Hash the new password
    const hashNewPassword = this.getHashPassword(updatePassword.newPassword);

    // Update the password in the database
    const updateResult = await this.userModel.updateOne(
      { _id: userDB._id },
      { password: hashNewPassword },
    );

    return {
      updateResult,
    };
  }
  async forgotPassword(forgotPassword: ForgotPassword) {
    const userDB = await this.userModel.findOne({
      email: forgotPassword.email,
    });

    if (!userDB) {
      throw new BadRequestException('User not found');
    }

    // Hash the new password
    const hashNewPassword = this.getHashPassword(forgotPassword.password);

    // Update the password in the database
    const updateResult = await this.userModel.updateOne(
      { _id: userDB._id },
      { password: hashNewPassword },
    );
    return {
      updateResult,
    };
  }
  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      {
        _id,
      },
      {
        refreshToken,
      },
    );
  };
}
