import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto/create-user.dto";
import {UsersService} from "./users.service";
import {UpdateUserDto} from "./dto/update-user.dto/update-user.dto";
import { ApiTags} from "@nestjs/swagger";

@ApiTags('Users')
@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}

    @Get()
    findAll(@Query('role') role?: 'INTERN' | 'ENGINEER' | 'ADMIN') {
        return this.usersService.findAll();
    }


    @Get(':id')
    findOne(@Param('id',ParseIntPipe) id: number) {
        return this.usersService.findOne(id)
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto ) {
        return this.usersService.create(createUserDto);
    }

    @Patch(':id')
    update(@Param('id',ParseIntPipe) id: number, @Body() userUpdateDto: UpdateUserDto) {
        return this.usersService.update(id, userUpdateDto);
    }

    @Delete(':id')
    delete(@Param('id',ParseIntPipe) id: number) {
        return this.usersService.delete(id);
    }
}
