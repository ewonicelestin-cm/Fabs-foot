export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';

export type PaymentProvider = 'MTN_MOMO' | 'ORANGE_MONEY' | 'STRIPE' | 'PAYPAL';

export interface UserProfile {
  id: string;
  email: string;
  isPremium: boolean;
  subscription?: UserSubscription;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerTransactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
}

export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'MONTHLY' | 'YEARLY';
  features: string[];
}
