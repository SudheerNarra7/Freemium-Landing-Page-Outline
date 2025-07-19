import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BusinessModule } from './business/business.module';
import { UserModule } from './user/user.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BusinessModule,
    UserModule,
    SubscriptionModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
