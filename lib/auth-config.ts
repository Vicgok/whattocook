/** Public feature flags intentionally default off: a visible provider must work. */
export const authConfig = {
  emailMagicLink:
    process.env.EXPO_PUBLIC_AUTH_EMAIL_MAGIC_LINK_ENABLED === "true",
  google: process.env.EXPO_PUBLIC_AUTH_GOOGLE_ENABLED === "true",
  apple: process.env.EXPO_PUBLIC_AUTH_APPLE_ENABLED === "true",
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL,
  privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL,
};
