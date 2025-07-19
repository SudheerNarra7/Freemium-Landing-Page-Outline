import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  hasAcceptedTerms?: boolean;
}

export interface CreateBusinessDto {
  googlePlaceId: string;
  name: string;
  address: string;
  phone: string;
  userId: string;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(userData: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        hasAcceptedTerms: userData.hasAcceptedTerms || false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        hasAcceptedTerms: true,
        createdAt: true,
        // Don't return password
      },
    });

    return user;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        business: true,
      },
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        business: true,
      },
    });
  }

  async createBusiness(businessData: CreateBusinessDto) {
    return this.prisma.business.create({
      data: {
        googlePlaceId: businessData.googlePlaceId,
        name: businessData.name,
        address: businessData.address,
        phone: businessData.phone,
        userId: businessData.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async updateUser(id: string, updateData: Partial<CreateUserDto>) {
    const data: any = { ...updateData };
    
    if (updateData.password) {
      data.password = await bcrypt.hash(updateData.password, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        business: true,
      },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        business: true,
      },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
} 