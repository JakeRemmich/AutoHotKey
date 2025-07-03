import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Check, Crown, Zap, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '@/api/user';
import { useToast } from '@/hooks/useToast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  usage: {
    scriptsGenerated: number;
    limit: number;
    plan: string;
  };
}

export function UpgradeModal({ isOpen, onClose, usage }: UpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpgrade = async (planType: 'monthly' | 'per-script') => {
    setIsProcessing(planType);
    try {
      const result = await createCheckoutSession({ planType }) as { url: string };
      // In a real app, redirect to Stripe checkout
      window.open(result.url, '_blank');
      toast({
        title: "Redirecting to checkout",
        description: "You'll be redirected to complete your payment"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-800">
            Upgrade Your Account
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            You've used {usage.scriptsGenerated} of {usage.limit} free script generations
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Monthly Plan */}
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-gray-800">Monthly Plan</CardTitle>
              <div className="text-3xl font-bold text-blue-600">$9.99<span className="text-sm text-gray-500">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Unlimited script generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Save unlimited scripts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Advanced script features</span>
                </li>
              </ul>
              <Button
                onClick={() => handleUpgrade('monthly')}
                disabled={isProcessing !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing === 'monthly' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Select Monthly Plan'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Pay Per Script */}
          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl text-gray-800">Pay Per Script</CardTitle>
              <div className="text-3xl font-bold text-green-600">$0.99<span className="text-sm text-gray-500">/script</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">No monthly commitment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Pay only when you need</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Save generated scripts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Standard support</span>
                </li>
              </ul>
              <Button
                onClick={() => handleUpgrade('per-script')}
                disabled={isProcessing !== null}
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
              >
                {isProcessing === 'per-script' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Buy Single Script'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={onClose} className="text-gray-600">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}