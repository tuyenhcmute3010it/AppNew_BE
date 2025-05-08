import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema'; // Assuming you have a User schema

export type LikeDocument = HydratedDocument<Like>;

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' })
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
