import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument } from './schemas/like.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { IUser } from 'src/users/users.interface';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name)
    private likeModel: SoftDeleteModel<LikeDocument>,
  ) {}

  async create(createLikeDto: CreateLikeDto, user: IUser) {
    const { article, quantity } = createLikeDto;

    let like = await this.likeModel.findOne({
      article,
      user: user._id,
    });

    if (!like) {
      like = await this.likeModel.create({
        article,
        user: user._id,
        quantity,
      });
      return { message: 'Like created successfully', data: like };
    } else {
      if (like.quantity === quantity) {
        // Remove like/dislike if same quantity
        await this.likeModel.deleteOne({ _id: like._id });
        return { message: 'Like removed successfully', data: null };
      } else {
        // Toggle like to dislike or vice versa
        like = await this.likeModel.findByIdAndUpdate(
          like._id,
          { quantity, updatedAt: new Date() },
          { new: true },
        );
        return { message: 'Like updated successfully', data: like };
      }
    }
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    filter.user = user._id;

    // Ensure article filter is applied if provided
    // if (qs.includes('article')) {
    //   const articleId = new URLSearchParams(qs).get('article');
    //   if (articleId) {
    //     filter.article = articleId;
    //   }
    // }

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit ? limit : 10;
    const totalItems = (await this.likeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.likeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select(projection)
      .populate({
        path: 'article',
        select: '_id title thumbnail',
      })
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
  async findOneByArticle(articleId: string, user: IUser) {
    const like = await this.likeModel
      .findOne({
        article: articleId,
        user: user._id,
      })
      .populate({
        path: 'article',
        select: '_id title thumbnail',
      });
    return { message: 'Like found', data: like || null };
  }

  async update(id: string, updateLikeDto: UpdateLikeDto) {
    const like = await this.likeModel.findByIdAndUpdate(id, updateLikeDto, {
      new: true,
    });
    if (!like) {
      throw new NotFoundException('Like not found');
    }
    return { message: 'Like updated successfully', data: like };
  }

  async remove(id: string) {
    const like = await this.likeModel.findByIdAndDelete(id);
    if (!like) {
      throw new NotFoundException('Like not found');
    }
    return { message: 'Like removed successfully' };
  }
}
