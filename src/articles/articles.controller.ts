// src/articles/articles.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ResponseMessage('create article')
  create(@Body() createArticleDto: CreateArticleDto, @User() user: IUser) {
    return this.articlesService.create(createArticleDto, user);
  }

  @Get()
  @ResponseMessage('get all articles')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.articlesService.findAll(+currentPage, +limit, qs);
  }
  @Get('/notifications')
  @ResponseMessage('get all articles')
  findAllNotifications(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.articlesService.findAllNotifications(
      +currentPage,
      +limit,
      qs,
      user,
    );
  }

  @Get(':id')
  @ResponseMessage('get article by id')
  findOne(@Param('id') id: string, @User() user: IUser) {
    return this.articlesService.findOne(id, user);
  }

  @Put(':id')
  @ResponseMessage('update article')
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @User() user: IUser,
  ) {
    return this.articlesService.update(id, updateArticleDto, user);
  }

  @Delete(':id')
  @ResponseMessage('delete article')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.articlesService.remove(id, user);
  }
}
