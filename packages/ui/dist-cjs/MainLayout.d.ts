import "./_MainLayout.css";
import type React from "react";
export interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  title?: string;
}
export declare function MainLayout({
  children,
  sidebar,
  header,
  title,
}: MainLayoutProps): JSX.Element;
//# sourceMappingURL=MainLayout.d.ts.map
