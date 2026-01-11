import { useEffect, useState } from "react";

/**
 * ClientOnly component that only renders children on the client side.
 * Useful for components that don't work well with SSR (like Tamagui).
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
