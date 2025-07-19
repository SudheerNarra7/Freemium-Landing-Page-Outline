import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Headers,
  RawBody,
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { SubscriptionService, CreateSubscriptionDto } from './subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('checkout')
  async createCheckoutSession(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    try {
      const session = await this.subscriptionService.createCheckoutSession(createSubscriptionDto);
      return { url: session.url };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create checkout session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('process-payment')
  async processPayment(@Body() paymentData: any) {
    try {
      const result = await this.subscriptionService.processDirectPayment(paymentData);
      return { success: true, subscription: result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Payment processing failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('webhook')
  async handleWebhook(
    @Body() rawBody: string,
    @Headers('stripe-signature') signature: string
  ) {
    try {
      return await this.subscriptionService.handleStripeWebhook(rawBody, signature);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Webhook processing failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('user/:userId')
  async getUserSubscriptions(@Param('userId') userId: string) {
    try {
      return await this.subscriptionService.getUserSubscriptions(userId);
    } catch (error: any) {
      throw new HttpException(
        'Failed to fetch user subscriptions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('user/:userId/active')
  async getActiveSubscription(@Param('userId') userId: string) {
    try {
      return await this.subscriptionService.getActiveSubscription(userId);
    } catch (error: any) {
      throw new HttpException(
        'Failed to fetch active subscription',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('user/:userId/portal')
  async createPortalSession(
    @Param('userId') userId: string,
    @Body('returnUrl') returnUrl: string
  ) {
    try {
      const portalUrl = await this.subscriptionService.getSubscriptionPortalUrl(
        userId, 
        returnUrl
      );
      return { url: portalUrl };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create portal session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':subscriptionId')
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string) {
    try {
      return await this.subscriptionService.cancelSubscription(subscriptionId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to cancel subscription',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 