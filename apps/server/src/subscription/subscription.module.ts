import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PrismaService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {} 