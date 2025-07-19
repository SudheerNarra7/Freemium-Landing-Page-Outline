import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateSubscriptionDto {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface ProcessPaymentDto {
  userId: string;
  priceId: string;
  amount: number;
  currency: string;
  paymentDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    billingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  planDetails: {
    name: string;
    price: string;
    features: string[];
  };
}

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey || stripeSecretKey.includes('your_stripe_secret_key') || stripeSecretKey.length < 20) {
      console.warn('STRIPE_SECRET_KEY not configured properly, subscription features will use mock mode');
      // For development, create a dummy Stripe instance
      this.stripe = {} as Stripe;
    } else {
      this.stripe = new Stripe(stripeSecretKey);
    }
  }

  async createCheckoutSession(createSubscriptionDto: CreateSubscriptionDto) {
    const { userId, priceId, successUrl, cancelUrl } = createSubscriptionDto;

    // For development, return a mock URL if Stripe is not configured
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeKey || stripeKey.includes('your_stripe_secret_key') || stripeKey.length < 20) {
      console.log('Using mock payment mode - redirecting to success page');
      return {
        url: `${successUrl}?payment_success=true&mock=true`,
        id: 'mock_session_id'
      };
    }

    // Find or create Stripe customer
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
    });

    return session;
  }

  async processDirectPayment(paymentData: ProcessPaymentDto) {
    const { userId, amount, currency, paymentDetails, planDetails } = paymentData;

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // For development/demo purposes, we'll simulate payment processing
    // In production, you would integrate with a real payment processor
    
    // Simulate payment validation
    if (!paymentDetails.cardNumber || paymentDetails.cardNumber.length < 16) {
      throw new Error('Invalid card number');
    }
    
    if (!paymentDetails.expiryDate || !paymentDetails.expiryDate.includes('/')) {
      throw new Error('Invalid expiry date');
    }
    
    if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) {
      throw new Error('Invalid CVV');
    }

    // Create subscription record in database
    const subscriptionData = {
      userId: userId,
      stripeSubscriptionId: `demo_sub_${Date.now()}`, // Demo subscription ID
      stripePriceId: paymentData.priceId,
      stripeCustomerId: user.stripeCustomerId || `demo_cus_${Date.now()}`,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
      amount: amount,
      currency: currency.toLowerCase(),
      plan: 'premium',
    };

    // Store subscription in database
    const subscription = await this.prisma.subscription.create({
      data: subscriptionData,
    });

    // Update user's Stripe customer ID if not set
    if (!user.stripeCustomerId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: subscriptionData.stripeCustomerId },
      });
    }

    console.log('✅ Payment processed successfully for user:', userId);
    console.log('📄 Subscription created:', subscription.id);
    console.log('💳 Plan:', planDetails.name, '-', planDetails.price);
    console.log('🏦 Payment method: **** **** ****', paymentDetails.cardNumber.slice(-4));
    console.log('📍 Billing:', paymentDetails.billingAddress.city, paymentDetails.billingAddress.state);

    return {
      id: subscription.id,
      status: subscription.status,
      plan: planDetails.name,
      amount: amount,
      currency: currency,
      nextBillingDate: subscription.currentPeriodEnd,
      features: planDetails.features,
    };
  }

  private getCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    return 'unknown';
  }

  async handleStripeWebhook(body: string, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle successful subscription creation
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
        await this.handleSuccessfulPayment(session);
      }
    }

    return { received: true };
  }

  private async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('No userId found in session metadata');
      return;
    }

    // Create a basic subscription record
    const subscriptionData = {
      userId: userId,
      stripeSubscriptionId: session.subscription as string,
      stripePriceId: 'premium', // Default plan
      stripeCustomerId: session.customer as string,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
      amount: 3450, // $34.50 in cents
      currency: 'usd',
      plan: 'premium',
    };

    // Create subscription record
    await this.prisma.subscription.create({
      data: subscriptionData,
    });
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActiveSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['active', 'trialing'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // For development, just update the database
    if (!this.configService.get('STRIPE_SECRET_KEY')) {
      return this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: { 
          status: 'canceled',
          cancelAtPeriodEnd: true 
        },
      });
    }

    // Cancel in Stripe
    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update in database
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { cancelAtPeriodEnd: true },
    });
  }

  async getSubscriptionPortalUrl(userId: string, returnUrl: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.stripeCustomerId) {
      throw new Error('No Stripe customer found for user');
    }

    // For development, return a mock URL
    if (!this.configService.get('STRIPE_SECRET_KEY')) {
      return returnUrl;
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }
} 