import { useEffect, useState } from "react";

/**
 * ClientOnly component that only renders children on the client side.
 * Useful for components that don't work well with SSR (like Tamagui).
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  console.log("ClientOnly render: hasMounted =", hasMounted);

  useEffect(() => {
    console.log("ClientOnly mounted effect");
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div style={{ padding: 20, background: 'red', color: 'white' }}>ClientOnly: Not Mounted yet...</div>;
  }

  console.log("ClientOnly rendering children");
  return <>{children}</>;
}
