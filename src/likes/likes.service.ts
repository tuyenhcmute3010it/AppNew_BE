import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument } from './schemas/like.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name)
    private likeModel: SoftDeleteModel<LikeDocument>,
  ) {}

  async create(createLikeDto: CreateLikeDto, user: IUser) {
    const { restaurant, quantity } = createLikeDto;

    // Check if a like exists for the user and restaurant
    let like = await this.likeModel.findOne({
      restaurant,
      user: user._id,
    });

    if (!like) {
      // Create new like with quantity: 1 (ignore provided quantity for new likes)
      like = await this.likeModel.create({
        restaurant,
        user: user._id,
        quantity: 1,
      });
      return { message: 'Like created successfully', data: like };
    } else {
      // Update existing like based on current quantity and requested quantity
      if (like.quantity === 1 && quantity === -1) {
        // Toggle from like to dislike
        like = await this.likeModel.findByIdAndUpdate(
          like._id,
          { quantity: -1, updatedAt: new Date() },
          { new: true },
        );
      } else if (like.quantity === -1 && quantity === 1) {
        // Toggle from dislike to like
        like = await this.likeModel.findByIdAndUpdate(
          like._id,
          { quantity: 1, updatedAt: new Date() },
          { new: true },
        );
      }
      // else {
      //   // No change needed (e.g., already liked and requesting like)
      //   throw new BadRequestException(
      //     `Restaurant is already ${like.quantity === 1 ? 'liked' : 'disliked'}`,
      //   );
      // }
      return { message: 'Like updated successfully', data: like };
    }
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    // Filter by authenticated user
    filter.user = user._id;

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
        path: 'restaurant',
        select: '_id name image', // Include fields needed by frontend
      })
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result, // Array of likes with populated restaurant
    };
  }
  async findOneByRestaurant(restaurantId: string, user: IUser) {
    const like = await this.likeModel.findOne({
      restaurant: restaurantId,
      user: user._id,
    });
    if (!like) {
      return { message: 'No like found', data: null };
    }
    return { message: 'Like found', data: like };
  }

  // Optional: Keep original findOne if needed for like ID
  async findOne(id: string) {
    const like = await this.likeModel.findById(id);
    if (!like) {
      throw new NotFoundException('Like not found');
    }
    return { message: 'Like found', data: like };
  }

  update(id: number, updateLikeDto: UpdateLikeDto) {
    return `This action updates a #${id} like`;
  }

  remove(id: number) {
    return `This action removes a #${id} like`;
  }
}
