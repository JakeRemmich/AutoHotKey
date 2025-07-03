const Stripe = require('stripe');
const SubscriptionPlan = require('../models/SubscriptionPlan');

class StripeService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      this.stripe = null;
    } else {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      console.log('Stripe service initialized successfully');
    }
  }

  async createProduct(name, description) {
    try {
      console.log(`Creating Stripe product: ${name}`);
      
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      const product = await this.stripe.products.create({
        name,
        description,
        type: 'service'
      });

      console.log(`Successfully created Stripe product: ${product.id}`);
      return product;
    } catch (error) {
      console.error(`Error creating Stripe product: ${error.message}`);
      throw error;
    }
  }

  async createPrice(productId, amount, currency = 'usd', interval = 'month') {
    try {
      console.log(`Creating Stripe price for product: ${productId}, amount: ${amount}`);
      
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      const priceData = {
        product: productId,
        unit_amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase()
      };

      if (interval !== 'one_time') {
        priceData.recurring = { interval };
      }

      const price = await this.stripe.prices.create(priceData);

      console.log(`Successfully created Stripe price: ${price.id}`);
      return price;
    } catch (error) {
      console.error(`Error creating Stripe price: ${error.message}`);
      throw error;
    }
  }

  async createCustomer(email, name = null) {
    try {
      console.log(`Creating Stripe customer for email: ${email}`);
      
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      const customer = await this.stripe.customers.create({
        email,
        name
      });

      console.log(`Successfully created Stripe customer: ${customer.id}`);
      return customer;
    } catch (error) {
      console.error(`Error creating Stripe customer: ${error.message}`);
      throw error;
    }
  }

  async createCheckoutSession(priceId, customerId, successUrl, cancelUrl, planType = 'monthly') {
    try {
      console.log(`Creating checkout session for price: ${priceId}, customer: ${customerId}`);
      
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      const sessionData = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: planType === 'per-script' ? 'payment' : 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          planType
        }
      };

      const session = await this.stripe.checkout.sessions.create(sessionData);

      console.log(`Successfully created checkout session: ${session.id}`);
      return session;
    } catch (error) {
      console.error(`Error creating checkout session: ${error.message}`);
      throw error;
    }
  }

  async getSubscription(subscriptionId) {
    try {
      console.log(`Retrieving subscription: ${subscriptionId}`);
      
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      console.log(`Successfully retrieved subscription: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      console.error(`Error retrieving subscription: ${error.message}`);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      console.log(`Canceling subscription: ${subscriptionId}`);
      
      if (!this.stripe) {
        throw new Error('Stripe is not configured');
      }

      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      console.log(`Successfully canceled subscription: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      console.error(`Error canceling subscription: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new StripeService();