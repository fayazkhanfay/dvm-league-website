// Stripe configuration helper that selects keys based on user's demo status

export function getStripeKeys(isDemoUser: boolean) {
  // If user is marked as demo, use test keys, otherwise use live keys
  const secretKey = isDemoUser ? process.env.STRIPE_SECRET_KEY_TEST : process.env.STRIPE_SECRET_KEY

  // Validate that the required secret key exists
  if (!secretKey) {
    const keyName = isDemoUser ? "STRIPE_SECRET_KEY_TEST" : "STRIPE_SECRET_KEY"
    throw new Error(
      `Missing required environment variable: ${keyName}. ` + `Please add it to your Vercel project settings.`,
    )
  }

  const publishableKey = isDemoUser
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  // Validate that the required publishable key exists
  if (!publishableKey) {
    const keyName = isDemoUser ? "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST" : "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    throw new Error(
      `Missing required environment variable: ${keyName}. ` + `Please add it to your Vercel project settings.`,
    )
  }

  return {
    secretKey,
    publishableKey,
    isDemo: isDemoUser,
  }
}
