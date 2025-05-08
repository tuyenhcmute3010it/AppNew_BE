// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Type } from 'class-transformer';
// import { IsNumber, IsString, Max, Min } from 'class-validator';
// import mongoose, { HydratedDocument } from 'mongoose';
// import { Restaurant } from 'src/restaurants/schemas/restaurant.schema';

// export type LikeDocument = HydratedDocument<Like>;

// @Schema({ timestamps: true })
// export class Like {
//   @Prop()
//   createdAt: Date;
//   @Prop()
//   updatedAt: Date;

//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' })
//   restaurant: Restaurant;

//   @Prop()
//   quantity: number;
// }
// export const LikeSchema = SchemaFactory.createForClass(Like);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Restaurant } from 'src/restaurants/schemas/restaurant.schema';
import { User } from 'src/users/schemas/user.schema'; // Assuming you have a User schema

export type LikeDocument = HydratedDocument<Like>;

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' })
  restaurant: Restaurant;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User; // Required for user-specific likes

  @Prop()
  quantity: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
