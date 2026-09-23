import { UserProfile, UserSubscription, PremiumPlan } from "../../types/premium";

/**
 * FAB-FOOT - Premium Service Infrastructure
 * This service handles the bridge between the client and the future payment backend.
 * All logic here is prepared but disabled until feature flags are activated on the server.
 */

class PremiumService {
  private static instance: PremiumService;
  private constructor() {}

  public static getInstance(): PremiumService {
    if (!PremiumService.instance) {
      PremiumService.instance = new PremiumService();
    }
    return PremiumService.instance;
  }

  /**
   * Checks if the current user has access to a specific premium service.
   * ACCESS IS VERIFIED ON THE SERVER. This is a client-side helper.
   */
  public async checkAccess(serviceKey: string): Promise<boolean> {
    // In the future, this will call: GET /api/premium/check-access?service=serviceKey
    // For now, it returns false (all premium features disabled)
    return false;
  }

  /**
   * Fetches the user's subscription status from the server.
   */
  public async getSubscriptionStatus(): Promise<UserSubscription | null> {
    // Future call: GET /api/user/subscription
    return null;
  }

  /**
   * Initiates a payment request.
   * This architecture supports both local (MoMo) and international providers.
   */
  public async initiatePayment(
    planId: string,
    provider: 'MTN_MOMO' | 'ORANGE_MONEY' | 'STRIPE'
  ): Promise<{ transactionId: string; redirectUrl?: string }> {
    // Future call: POST /api/payments/initiate { planId, provider }
    throw new Error("Payments are not yet active in this version.");
  }

  /**
   * Fetches available premium plans.
   */
  public async getAvailablePlans(): Promise<PremiumPlan[]> {
    // Future call: GET /api/premium/plans
    return [];
  }
}

export const premiumService = PremiumService.getInstance();
