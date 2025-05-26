// create-like.dto.ts
import { IsNotEmpty, IsMongoId, IsIn } from 'class-validator';

export class CreateLikeDto {
  @IsNotEmpty()
  @IsMongoId()
  article: string; // Changed from restaurant to article

  @IsNotEmpty()
  @IsIn([1, -1])
  quantity: number;
}
