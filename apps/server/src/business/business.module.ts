import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [BusinessController],
  providers: [BusinessService, PrismaService],
  exports: [BusinessService],
})
export class BusinessModule {}
