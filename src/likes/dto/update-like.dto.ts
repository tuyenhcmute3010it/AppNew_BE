// update-like.dto.ts
import { IsOptional, IsIn } from 'class-validator';

export class UpdateLikeDto {
  @IsOptional()
  @IsIn([1, -1])
  quantity?: number;
}
