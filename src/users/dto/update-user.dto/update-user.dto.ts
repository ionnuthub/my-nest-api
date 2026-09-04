import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../create-user.dto/create-user.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['name'] as const),
) {
  @ApiPropertyOptional({
    example: 'Nume nou',
  })
  name?: string;
}
