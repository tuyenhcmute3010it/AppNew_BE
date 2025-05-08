// import { Type } from 'class-transformer';
// import { IsMongoId, IsNumber, Min } from 'class-validator';

// export class CreateLikeDto {
//   @IsMongoId()
//   restaurant: string;

//   @Type(() => Number) // <-- ADD THIS
//   @IsNumber()
//   quantity: number;
// }

import { Type } from 'class-transformer';
import { IsIn, IsMongoId, IsNumber, Min } from 'class-validator';

export class CreateLikeDto {
  @IsMongoId()
  restaurant: string;

  //   @IsMongoId()
  //   user?: string; // Optional, include if user-specific likes are needed

  @Type(() => Number)
  @IsNumber()
  @IsIn([1, -1], { message: 'Quantity must be 1 (like) or -1 (dislike)' })
  quantity: number;
}
