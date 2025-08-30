const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const stripeService = require('./stripeService');

class SubscriptionService {
  async getSubscriptionPlans(activeOnly = true) {
    try {
      console.log('Retrieving subscription plans');

      const filter = activeOnly ? { isActive: true } : {};
      const plans = await SubscriptionPlan.find(filter).sort({ price: 1 });

      console.log(`Successfully retrieved ${plans.length} subscription plans`);
      return plans;
    } catch (error) {
      console.error(`Error retrieving subscription plans: ${error.message}`);
      throw error;
    }
  }
  async createSubscriptionPlan(planData) {
    try {
      console.log(`Creating subscription plan: ${planData.name}`);

      // Create product in Stripe
      const product = await stripeService.createProduct(planData.name, planData.description);

      // Create price in Stripe
      const price = await stripeService.createPrice(
        product.id,
        planData.price,
        planData.currency,
        planData.interval
      );

      // Save plan to database
      const subscriptionPlan = new SubscriptionPlan({
        ...planData,
        stripeProductId: product.id,
        stripePriceId: price.id
      });

      await subscriptionPlan.save();

      console.log(`Successfully created subscription plan: ${subscriptionPlan._id}`);
      return subscriptionPlan;
    } catch (error) {
      console.error(`Error creating subscription plan: ${error.message}`);
      throw error;
    }
  }

  async hardDeleteSubscriptionPlan(planId) {
    try {
      console.log(`Hard deleting subscription plan: ${planId}`);

      const existingPlan = await SubscriptionPlan.findById(planId);
      if (!existingPlan) {
        throw new Error('Subscription plan not found');
      }

      // WARNING: This will attempt to delete from Stripe
      // This may fail if the product/price has been used
      try {
        if (existingPlan.stripePriceId) {
          // Try to delete price - this will fail if it's been used
          await stripeService.deletePrice(existingPlan.stripePriceId);
        }
      } catch (stripeError) {
        console.warn(`Could not delete Stripe price: ${stripeError.message}`);
        // Archive instead if deletion fails
        await stripeService.archivePrice(existingPlan.stripePriceId);
      }

      try {
        if (existingPlan.stripeProductId) {
          // Try to delete product - this will fail if it has prices or has been used
          await stripeService.deleteProduct(existingPlan.stripeProductId);
        }
      } catch (stripeError) {
        console.warn(`Could not delete Stripe product: ${stripeError.message}`);
        // Archive instead if deletion fails
        await stripeService.archiveProduct(existingPlan.stripeProductId);
      }

      // Clean up related data in your database
      await this.cleanupRelatedData(planId);

      // Delete from database
      await SubscriptionPlan.findByIdAndDelete(planId);

      console.log(`Successfully hard deleted subscription plan: ${planId}`);
      return { deleted: true };
    } catch (error) {
      console.error(`Error hard deleting subscription plan: ${error.message}`);
      throw error;
    }
  }

  async editSubscriptionPlan(planData) {
    try {
      console.log(`Editing subscription plan: ${planData.id}`);

      // Get existing plan from database
      const existingPlan = await SubscriptionPlan.findById(planData.id);
      if (!existingPlan) {
        throw new Error('Subscription plan not found');
      }

      // Check if we need to update Stripe product (name or description changed)
      let stripeProductId = existingPlan.stripeProductId;
      if (planData.name !== existingPlan.name || planData.description !== existingPlan.description) {
        const updatedProduct = await stripeService.updateProduct(
          existingPlan.stripeProductId,
          planData.name,
          planData.description
        );
        stripeProductId = updatedProduct.id;
      }

      // Check if we need to create new price (price, currency, or interval changed)
      let stripePriceId = existingPlan.stripePriceId;
      const priceChanged = planData.price !== existingPlan.price;
      const currencyChanged = planData.currency !== existingPlan.currency;
      const intervalChanged = planData.interval !== existingPlan.interval;

      if (priceChanged || currencyChanged || intervalChanged) {
        // Archive old price in Stripe
        await stripeService.archivePrice(existingPlan.stripePriceId);

        // Create new price
        const newPrice = await stripeService.createPrice(
          stripeProductId,
          planData.price,
          planData.currency,
          planData.interval
        );
        stripePriceId = newPrice.id;
      }

      // Update plan in database
      const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
        planData.id,
        {
          name: planData.name,
          description: planData.description,
          price: planData.price,
          interval: planData.interval,
          currency: planData.currency,
          features: planData.features,
          // planType: planData.planType,
          stripeProductId,
          stripePriceId,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      console.log(`Successfully updated subscription plan: ${updatedPlan._id}`);
      return updatedPlan;
    } catch (error) {
      console.error(`Error editing subscription plan: ${error.message}`);
      throw error;
    }
  }
  async deleteSubscriptionPlan(planId) {
    try {
      console.log(`Deleting subscription plan: ${planId}`);

      // Get existing plan from database
      const existingPlan = await SubscriptionPlan.findById(planId);
      if (!existingPlan) {
        throw new Error('Subscription plan not found');
      }

      // Archive Stripe price (make it inactive)
      if (existingPlan.stripePriceId) {
        await stripeService.archivePrice(existingPlan.stripePriceId);
      }

      // Archive Stripe product (make it inactive)
      if (existingPlan.stripeProductId) {
        await stripeService.archiveProduct(existingPlan.stripeProductId);
      }

      const deletedPlan = await SubscriptionPlan.findByIdAndDelete(planId);


      console.log(`Successfully deleted subscription plan: ${planId}`);
      return deletedPlan;
    } catch (error) {
      console.error(`Error deleting subscription plan: ${error.message}`);
      throw error;
    }
  }

  // Check if plan has active subscriptions
  async checkActiveSubscriptions(planId) {
    try {
      // Assuming you have a Subscription model/collection
      const activeSubscriptionCount = await User.countDocuments({
        subscription_plan_id: planId,
        subscriptionStatus: { $in: ["active", "past_due"] }
      });

      return activeSubscriptionCount > 0;
    } catch (error) {
      console.error(`Error checking active subscriptions: ${error.message}`);
      throw error;
    }
  }

  async getSubscriptionPlanById(planId) {
    try {
      const plan = await SubscriptionPlan.findById(planId);
      return plan;
    } catch (error) {
      console.error(`Error getting subscription plan: ${error.message}`);
      throw error;
    }
  }



  async createCheckoutSession(userId, planId, successUrl, cancelUrl) {
    try {
      console.log(`Creating checkout session for user: ${userId}, plan: ${planId}`);

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const plan = await SubscriptionPlan.findById(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Check if we have a valid Stripe customer ID for current mode
      let customerId = user.stripeCustomerId;
      let needsNewCustomer = false;

      if (customerId) {
        try {
          // Try to retrieve the customer to see if it exists in current mode
          console.log(`Checking if customer ${customerId} exists in current Stripe mode`);
          await stripeService.stripe.customers.retrieve(customerId);
          console.log(`Customer ${customerId} exists in current mode`);
        } catch (error) {
          console.log(`Customer ${customerId} does not exist in current mode: ${error.message}`);
          needsNewCustomer = true;
        }
      } else {
        needsNewCustomer = true;
      }

      // Create new customer if needed
      if (needsNewCustomer) {
        console.log(`Creating new Stripe customer for user: ${userId}`);
        const customer = await stripeService.createCustomer(user.email);
        customerId = customer.id;

        // Update user with new Stripe customer ID
        await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
        console.log(`Updated user ${userId} with new customer ID: ${customerId}`);
      }

      // Create checkout session
      const session = await stripeService.createCheckoutSession(
        planId,
        plan.stripePriceId,
        customerId,
        successUrl,
        cancelUrl,
        plan.planType
      );

      console.log(`Successfully created checkout session for user: ${userId}`);
      return session;
    } catch (error) {
      console.error(`Error creating checkout session: ${error.message}`);
      throw error;
    }
  }

  async updateUserSubscription(userId, subscriptionData) {
    try {
      console.log(`=== UPDATING USER SUBSCRIPTION ===`);
      console.log(`Updating subscription for user: ${userId}`);
      console.log(`Subscription data:`, subscriptionData);

      // Get current user state before update
      const currentUser = await User.findById(userId);
      console.log(`Current user state - plan: ${currentUser.subscription_plan}, credits: ${currentUser.credits}, status: ${currentUser.subscriptionStatus}`);

      const updateData = {
        subscription_plan: subscriptionData.planType,
        subscription_plan_id: subscriptionData.subscription_plan_id,
        subscriptionStatus: subscriptionData.status,
        subscriptionEndDate: subscriptionData.endDate
      };

      if (subscriptionData.stripeSubscriptionId) {
        updateData.stripeSubscriptionId = subscriptionData.stripeSubscriptionId;
      }

      // Handle credits for per-script purchases
      if (subscriptionData.planType === 'per-script') {
        // For per-script plans, add credits instead of setting them
        if (subscriptionData.credits !== undefined) {
          // Add credits to existing credits instead of replacing them
          updateData.credits = (currentUser.credits || 0) + subscriptionData.credits;
          console.log(`Adding ${subscriptionData.credits} credits to existing ${currentUser.credits || 0} credits for user ${userId}`);
          console.log(`Total credits will be: ${updateData.credits}`);
        } else {
          // Default: give 1 credit for per-script purchase
          updateData.credits = (currentUser.credits || 0) + 1;
          console.log(`Adding default 1 credit to existing ${currentUser.credits || 0} credits for user ${userId}`);
          console.log(`Total credits will be: ${updateData.credits}`);
        }
      } else if (subscriptionData.credits !== undefined) {
        // For other plan types, set credits as specified
        updateData.credits = subscriptionData.credits;
        console.log(`Setting credits to ${subscriptionData.credits} for user ${userId}`);
      }

      console.log(`Update data being applied:`, updateData);

      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

      if (!user) {
        throw new Error(`User ${userId} not found during update`);
      }

      console.log(`User after update - plan: ${user.subscription_plan}, credits: ${user.credits}, status: ${user.subscriptionStatus}`);
      console.log(`Successfully updated subscription for user: ${userId}`);
      console.log(`=== END UPDATING USER SUBSCRIPTION ===`);
      return user;
    } catch (error) {
      console.error(`Error updating user subscription: ${error.message}`);
      console.error(`Error stack:`, error.stack);
      throw error;
    }
  }

  async getUserSubscriptionStatus(userId) {
    try {
      console.log(`Getting subscription status for user: ${userId}`);

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let subscriptionDetails = {
        plan: user.subscription_plan,
        status: user.subscriptionStatus,
        endDate: user.subscriptionEndDate,
        credits: user.credits || 0
      };

      // If user has active Stripe subscription, get latest status
      if (user.stripeSubscriptionId && user.subscriptionStatus === 'active') {
        try {
          const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
          subscriptionDetails.status = subscription.status;
          subscriptionDetails.endDate = new Date(subscription.current_period_end * 1000);
        } catch (error) {
          console.error(`Error fetching Stripe subscription: ${error.message}`);
        }
      }

      console.log(`Successfully retrieved subscription status for user: ${userId}`);
      return subscriptionDetails;
    } catch (error) {
      console.error(`Error getting subscription status: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SubscriptionService();