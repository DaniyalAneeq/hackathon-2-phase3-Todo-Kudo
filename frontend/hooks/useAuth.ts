import { authClient } from "@/lib/auth-client";

// Export Better Auth hooks for use in components
export const useSession = authClient.useSession;

export const signUp = authClient.signUp.email;
export const signIn = authClient.signIn.email;
export const signOut = authClient.signOut;

// Export the full auth client for advanced usage
export { authClient };
