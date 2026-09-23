/**
 * SERVER CONFIGURATION & FEATURE FLAGS
 */
export const serverConfig = {
    // Feature Flags - Can be toggled without code changes via Env Vars
    premium: {
        enabled: process.env.PREMIUM_ENABLED === 'true',
        paymentsEnabled: process.env.PAYMENTS_ENABLED === 'true',
        freeTrialDays: 0,
    },
    // Enabled Services (Gatekeeping)
    services: {
        advancedPredictions: process.env.SERVICE_ADVANCED_PREDICTIONS === 'true',
        deepAnalytics: process.env.SERVICE_DEEP_ANALYTICS === 'true',
        realTimeAlerts: process.env.SERVICE_REALTIME_ALERTS === 'true',
    },
    // Payment Provider Config (IDs only, secrets in .env)
    providers: {
        mtn: {
            merchantId: process.env.MTN_MERCHANT_ID,
            currency: 'XAF',
        },
        orange: {
            merchantId: process.env.ORANGE_MERCHANT_ID,
            currency: 'XAF',
        },
        stripe: {
            publicKey: process.env.STRIPE_PUBLIC_KEY,
            currency: 'EUR',
        }
    }
};
