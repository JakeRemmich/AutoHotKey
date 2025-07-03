import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, CreditCard, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { getSubscriptionStatus, cancelSubscription } from '@/api/subscriptions';
import { getUserUsage } from '@/api/user';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';

export function AccountSettings() {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [userUsage, setUserUsage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setIsLoading(true);
      const [statusResult, usageResult] = await Promise.all([
        getSubscriptionStatus(),
        getUserUsage()
      ]);
      
      setSubscriptionStatus(statusResult.data);
      setUserUsage(usageResult);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load account data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      await cancelSubscription();
      toast({
        title: "Success",
        description: "Subscription canceled successfully",
      });
      // Reload account data to reflect changes
      await loadAccountData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive"
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'canceled':
        return 'secondary';
      case 'past_due':
      case 'unpaid':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPlanDisplayName = (plan) => {
    switch (plan) {
      case 'free':
        return 'Free Plan';
      case 'monthly':
        return 'Monthly Plan';
      case 'per-script':
        return 'Pay Per Script';
      default:
        return plan;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and account preferences</p>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading account settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your subscription and account preferences</p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{getPlanDisplayName(userUsage?.plan)}</h3>
              <p className="text-gray-600">
                {userUsage?.plan === 'free' && 'Limited to 3 script generations'}
                {userUsage?.plan === 'monthly' && 'Unlimited script generations'}
                {userUsage?.plan === 'per-script' && 'Pay per script generation'}
              </p>
            </div>
            {subscriptionStatus?.status && (
              <Badge variant={getStatusBadgeVariant(subscriptionStatus.status)}>
                {subscriptionStatus.status}
              </Badge>
            )}
          </div>

          {userUsage?.plan === 'free' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Usage</span>
              </div>
              <p className="text-blue-700">
                {userUsage.scriptsGenerated} of {userUsage.limit} scripts generated
              </p>
            </div>
          )}

          {subscriptionStatus?.endDate && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {subscriptionStatus.status === 'canceled' ? 'Access ends on' : 'Next billing date'}: {' '}
                {format(new Date(subscriptionStatus.endDate), 'PPP')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Email Address</label>
            <p className="text-gray-800">{userUsage?.email}</p>
          </div>
          
          <Separator />
          
          <div>
            <label className="text-sm font-medium text-gray-600">Member Since</label>
            <p className="text-gray-800">
              {userUsage?.createdAt ? format(new Date(userUsage.createdAt), 'PPP') : 'N/A'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Last Login</label>
            <p className="text-gray-800">
              {userUsage?.lastLoginAt ? format(new Date(userUsage.lastLoginAt), 'PPP') : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management Card */}
      {userUsage?.plan !== 'free' && subscriptionStatus?.status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Subscription Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Cancel your subscription at any time. You'll continue to have access until your current billing period ends.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isCanceling}>
                    {isCanceling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Canceling...
                      </>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your subscription? You'll continue to have access until{' '}
                      {subscriptionStatus?.endDate && format(new Date(subscriptionStatus.endDate), 'PPP')}.
                      After that, your account will be downgraded to the free plan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">
                      Cancel Subscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Card for Free Users */}
      {userUsage?.plan === 'free' && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Upgrade Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Get unlimited script generations and advanced features with our premium plans.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/pricing">View Plans</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}