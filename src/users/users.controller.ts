import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdatePassword } from './dto/create-user.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('create a new user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/password')
  @ResponseMessage('update a password')
  updatePassword(@Body() updatePassword: UpdatePassword, @User() user: IUser) {
    return this.usersService.updatePassword(updatePassword, user);
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }
  @Get()
  @ResponseMessage('get all articles')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }
  @Get(':id')
  @ResponseMessage('Get a user')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put()
  @ResponseMessage('Update a user')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
