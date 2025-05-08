import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @ResponseMessage('create like')
  create(@Body() createLikeDto: CreateLikeDto, @User() user: IUser) {
    return this.likesService.create(createLikeDto, user);
  }

  @Get()
  @ResponseMessage('get all like')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.likesService.findAll(+currentPage, +limit, qs, user);
  }

  @Get(':restaurantId')
  @ResponseMessage('Get like by restaurant')
  findOne(@Param('restaurantId') restaurantId: string, @User() user: IUser) {
    return this.likesService.findOneByRestaurant(restaurantId, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
    return this.likesService.update(+id, updateLikeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.likesService.remove(+id);
  }
}
