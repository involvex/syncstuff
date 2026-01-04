import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { moon, sunny, contrastOutline } from "ionicons/icons";
import { useTheme } from "../../hooks/useTheme";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case "light":
        return sunny;
      case "dark":
        return moon;
      case "system":
        return contrastOutline;
      default:
        return contrastOutline;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "System";
    }
  };

  return (
    <IonButton onClick={toggleTheme} fill="clear">
      <IonIcon slot="start" icon={getIcon()} />
      {getLabel()}
    </IonButton>
  );
};
