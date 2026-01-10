import React from "react";
import { IonItem, IonLabel, IonIcon, IonBadge } from "@ionic/react";
import { document } from "ionicons/icons";
import { ProgressBar } from "./ProgressBar";
import type { FileTransfer } from "../../types/transfer.types";

interface TransferItemProps {
  transfer: FileTransfer;
}

export const TransferItem: React.FC<TransferItemProps> = ({ transfer }) => {
  const getStatusColor = () => {
    switch (transfer.status) {
      case "completed":
        return "success";
      case "failed":
        return "danger";
      case "transferring":
        return "primary";
      default:
        return "medium";
    }
  };

  return (
    <IonItem>
      <IonIcon slot="start" icon={document} size="large" />
      <IonLabel>
        <h2>{transfer.file.name}</h2>
        <p>
          {(transfer.file.size / 1024 / 1024).toFixed(2)} MB •{" "}
          {transfer.type === "send" ? "Sending to" : "Receiving from"} ...
        </p>

        {transfer.status === "transferring" && (
          <ProgressBar value={transfer.progress.percentage / 100} />
        )}
      </IonLabel>
      <IonBadge slot="end" color={getStatusColor()}>
        {transfer.status}
      </IonBadge>
    </IonItem>
  );
};
