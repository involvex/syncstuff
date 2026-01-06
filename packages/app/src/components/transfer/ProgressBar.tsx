import React from "react";
import { IonProgressBar, IonText } from "@ionic/react";

interface ProgressBarProps {
  value: number; // 0 to 1
  label?: string;
  buffer?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  buffer,
}) => {
  return (
    <div style={{ width: "100%", margin: "10px 0" }}>
      {label && (
        <IonText color="medium">
          <p style={{ fontSize: "0.8rem", marginBottom: "4px" }}>{label}</p>
        </IonText>
      )}
      <IonProgressBar value={value} buffer={buffer} color="primary" />
      <div
        style={{ textAlign: "right", fontSize: "0.75rem", marginTop: "2px" }}
      >
        {Math.round(value * 100)}%
      </div>
    </div>
  );
};
