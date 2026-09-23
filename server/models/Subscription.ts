/**
 * SUBSCRIPTION MODEL BLUEPRINT
 * Prepared for a database like MongoDB or PostgreSQL.
 */
export interface SubscriptionModel {
  _id: string; // Database ID
  userId: string; // Reference to User
  planId: string; // e.g., 'premium_monthly'
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentProvider: 'MTN_MOMO' | 'ORANGE_MONEY' | 'STRIPE';
  lastTransactionId: string;
  metadata: Record<string, any>;
}
