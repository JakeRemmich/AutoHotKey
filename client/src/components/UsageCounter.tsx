import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Crown, Zap, CreditCard } from 'lucide-react';

interface UsageCounterProps {
  usage: {
    scriptsGenerated: number;
    limit: number;
    plan: string;
    credits?: number;
  };
}

export function UsageCounter({ usage }: UsageCounterProps) {
  const getUsageDisplay = () => {
    if (usage.plan === 'free') {
      const percentage = (usage.scriptsGenerated / usage.limit) * 100;
      return {
        percentage,
        text: `${usage.scriptsGenerated}/${usage.limit} scripts`,
        showProgress: true
      };
    } else if (usage.plan === 'per-script') {
      return {
        percentage: 0,
        text: `${usage.credits || 0} credits remaining`,
        showProgress: false
      };
    } else {
      return {
        percentage: 0,
        text: 'Unlimited',
        showProgress: false
      };
    }
  };

  const displayData = getUsageDisplay();

  const getIcon = () => {
    if (usage.plan === 'per-script') {
      return <CreditCard className="h-4 w-4 text-green-600" />;
    } else if (usage.plan === 'monthly') {
      return <Crown className="h-4 w-4 text-yellow-600" />;
    } else {
      return <Zap className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPlanDisplayName = () => {
    switch (usage.plan) {
      case 'free':
        return 'Free Plan';
      case 'monthly':
        return 'Premium Plan';
      case 'per-script':
        return 'Pay Per Script';
      default:
        return 'Free Plan';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="text-sm font-medium text-gray-700">
              {getPlanDisplayName()}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {displayData.text}
          </span>
        </div>

        {displayData.showProgress && (
          <Progress
            value={displayData.percentage}
            className="h-2"
          />
        )}

        {usage.plan === 'free' && usage.scriptsGenerated >= usage.limit && (
          <div className="text-xs text-orange-600 mt-2">
            You've reached your free limit. Upgrade to continue generating scripts.
          </div>
        )}

        {usage.plan === 'per-script' && (usage.credits || 0) === 0 && (
          <div className="text-xs text-orange-600 mt-2">
            You have no credits remaining. Purchase more scripts to continue.
          </div>
        )}
      </CardContent>
    </Card>
  );
}