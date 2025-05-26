// src/articles/articles.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { IUser } from 'src/users/users.interface';
import { Article, ArticleDocument } from './schemas/article.schema';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name)
    private articleModel: SoftDeleteModel<ArticleDocument>,
  ) {}

  async create(createArticleDto: CreateArticleDto, user: IUser) {
    const { title, content, thumbnail } = createArticleDto;

    const article = await this.articleModel.create({
      title,
      content,
      thumbnail,
      author: user._id,
      createdBy: { _id: user._id, email: user.email },
    });

    return { message: 'Article created successfully', data: article };
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    // Log query for debugging
    console.log('Query params:', qs);
    console.log('Parsed filter:', filter);

    // Handle createdSince filter
    if (filter.createdSince) {
      try {
        filter.createdAt = { $gte: new Date(filter.createdSince) };
        console.log('Applied createdAt filter:', filter.createdAt);
      } catch (e) {
        console.error('Invalid createdSince format:', filter.createdSince);
      }
      delete filter.createdSince;
    }

    // Ensure only non-deleted articles
    filter.isDeleted = filter.isDeleted ?? false;

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit || 10;

    const totalItems = await this.articleModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.articleModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select(projection)
      .populate(population || { path: 'author', select: '_id name email' })
      .exec();

    return {
      meta: {
        current: currentPage || 1,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }
  async findOne(id: string, user: IUser) {
    const article = await this.articleModel
      .findOne({ _id: id, author: user._id })
      .populate({
        path: 'author',
        select: '_id name email',
      });

    if (!article || article.isDeleted) {
      throw new NotFoundException('Article not found');
    }

    return { message: 'Article found', data: article };
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, user: IUser) {
    const article = await this.articleModel.findOne({
      _id: id,
      author: user._id,
    });

    if (!article || article.isDeleted) {
      throw new NotFoundException('Article not found');
    }

    const updatedArticle = await this.articleModel.findByIdAndUpdate(
      id,
      {
        ...updateArticleDto,
        updatedBy: { _id: user._id, email: user.email },
        updatedAt: new Date(),
      },
      { new: true },
    );

    return { message: 'Article updated successfully', data: updatedArticle };
  }

  async remove(id: string, user: IUser) {
    const article = await this.articleModel.findOne({
      _id: id,
      author: user._id,
    });

    if (!article || article.isDeleted) {
      throw new NotFoundException('Article not found');
    }

    await this.articleModel.softDelete({ _id: id });
    return { message: 'Article deleted successfully' };
  }
}
