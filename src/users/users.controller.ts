import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Listează utilizatorii' })
  @ApiOkResponse({
    description: 'Lista utilizatorilor fără parole',
    schema: {
      example: [
        {
          id: 1,
          name: 'Elon Musk',
          email: 'john@example.com',
        },
      ],
    },
  })
  @Get()
  findAll(@Query('role') role?: 'INTERN' | 'ENGINEER' | 'ADMIN') {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Returnează un utilizator după id' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID-ul utilizatorului',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Utilizator găsit',
    schema: {
      example: {
        id: 1,
        name: 'Elon Musk',
        email: 'john@example.com',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Utilizatorul nu a fost găsit' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Creează un utilizator nou' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Utilizator creat cu succes',
    schema: {
      example: {
        id: 1,
        name: 'Elon Musk',
        email: 'john@example.com',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Emailul este deja folosit' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Actualizează un utilizator existent' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID-ul utilizatorului',
    example: 1,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Utilizator actualizat cu succes' })
  @ApiNotFoundResponse({ description: 'Utilizatorul nu a fost găsit' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() userUpdateDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, userUpdateDto);
  }

  @ApiOperation({ summary: 'Șterge un utilizator' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID-ul utilizatorului',
    example: 1,
  })
  @ApiOkResponse({ description: 'Utilizator șters cu succes' })
  @ApiNotFoundResponse({ description: 'Utilizatorul nu a fost găsit' })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}
