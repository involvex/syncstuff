import { Capacitor } from "@capacitor/core";
import type React from "react";
import { useEffect, useState } from "react";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const platform = Capacitor.getPlatform();

      // Desktop: >= 1024px or Electron
      const desktop = width >= 1024 || platform === "electron";
      // Tablet: 768px - 1023px
      const tablet = width >= 768 && width < 1024;
      // Mobile: < 768px
      const mobile = width < 768;

      setIsDesktop(desktop);
      setIsTablet(tablet);
      setIsMobile(mobile);

      // Add responsive classes to body
      document.body.classList.toggle("is-desktop", desktop);
      document.body.classList.toggle("is-tablet", tablet);
      document.body.classList.toggle("is-mobile", mobile);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  return (
    <div
      className={`responsive-layout ${isDesktop ? "desktop" : ""} ${
        isTablet ? "tablet" : ""
      } ${isMobile ? "mobile" : ""}`}
    >
      {children}
    </div>
  );
};
