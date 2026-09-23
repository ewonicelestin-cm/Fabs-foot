/**
 * TRANSACTION MODEL BLUEPRINT
 */
export interface TransactionModel {
  _id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string; // XAF, EUR, USD
  provider: 'MTN_MOMO' | 'ORANGE_MONEY' | 'STRIPE';
  providerTransactionId: string; // ID from MTN/Orange/Stripe
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  paymentDetails: {
    phoneNumber?: string; // For MoMo
    cardLast4?: string; // For Stripe
  };
  createdAt: Date;
}
