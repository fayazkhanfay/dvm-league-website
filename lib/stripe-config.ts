// Stripe configuration helper that selects keys based on user's demo status

export function getStripeKeys(isDemoUser: boolean) {
  // If user is marked as demo, use test keys, otherwise use live keys
  const secretKey = isDemoUser
    ? process.env.STRIPE_SECRET_KEY_TEST! // Test secret key
    : process.env.STRIPE_SECRET_KEY! // Live secret key

  const publishableKey = isDemoUser
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST! // Test publishable key
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! // Live publishable key

  return {
    secretKey,
    publishableKey,
    isDemo: isDemoUser,
  }
}
