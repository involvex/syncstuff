import { IonBadge, IonIcon, IonItem, IonLabel } from "@ionic/react";
import { document } from "ionicons/icons";
import type React from "react";
import type { FileTransfer } from "../../types/transfer.types";
import { ProgressBar } from "./ProgressBar";

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
      <IonIcon icon={document} size="large" slot="start" />
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
      <IonBadge color={getStatusColor()} slot="end">
        {transfer.status}
      </IonBadge>
    </IonItem>
  );
};
