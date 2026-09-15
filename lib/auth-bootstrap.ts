type BootstrapUser = { id: string };
type BootstrapClient = {
  auth: {
    getSession: () => Promise<{ data: { session: { user: BootstrapUser } | null } }>;
    signInAnonymously: () => Promise<{ data: { user: BootstrapUser | null }; error: Error | null }>;
  };
};

/** Creates a one-shot bootstrapper safe to call concurrently. */
export function createAnonymousSessionBootstrap(
  getClient: () => BootstrapClient | null,
  onAnonymousSignIn: () => void,
) {
  let bootstrap: Promise<string | null> | null = null;
  return () => {
    if (!bootstrap) {
      const client = getClient();
      if (!client) return Promise.resolve(null);
      bootstrap = client.auth.getSession().then(async ({ data }) => {
        if (data.session?.user) return data.session.user.id;
        onAnonymousSignIn();
        const result = await client.auth.signInAnonymously();
        if (result.error) throw result.error;
        return result.data.user?.id ?? null;
      });
    }
    return bootstrap;
  };
}
