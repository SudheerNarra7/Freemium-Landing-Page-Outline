import { Body, Controller, Get, Post, Param, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UserService, CreateUserDto, CreateBusinessDto } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userService.findUserByEmail(createUserDto.email);
      if (existingUser) {
        throw new HttpException('User with this email already exists', HttpStatus.CONFLICT);
      }

      return await this.userService.createUser(createUserDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getAllUsers() {
    try {
      return await this.userService.getAllUsers();
    } catch (error) {
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.userService.findUserById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    try {
      return await this.userService.updateUser(id, updateUserDto);
    } catch (error) {
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.deleteUser(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/business')
  async createBusiness(@Param('id') userId: string, @Body() createBusinessDto: Omit<CreateBusinessDto, 'userId'>) {
    try {
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (user.business) {
        throw new HttpException('User already has a business', HttpStatus.CONFLICT);
      }

      return await this.userService.createBusiness({
        ...createBusinessDto,
        userId,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create business', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 