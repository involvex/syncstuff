import "./_Navigation.css";
export interface NavigationProps {
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onDashboard?: () => void;
}
export declare function Navigation({
  isLoggedIn,
  onLogin,
  onSignup,
  onDashboard,
}: NavigationProps): JSX.Element;
//# sourceMappingURL=Navigation.d.ts.map
