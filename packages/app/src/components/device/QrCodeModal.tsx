import React from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
} from "@ionic/react";
import { shareOutline, copyOutline } from "ionicons/icons";
import { QRCodeCanvas } from "qrcode.react";
import { deepLinkService } from "../../services/network/deeplink.service";
import { clipboardService } from "../../services/sync/clipboard.service";

interface QrCodeModalProps {
  isOpen: boolean;
  textToShow: string;
  title?: string;
  onDismiss: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  textToShow,
  title = "Pair Device",
  onDismiss,
}) => {
  const pairingUrl = deepLinkService.generatePairingUrl();

  const handleCopyUrl = async () => {
    await clipboardService.writeText(pairingUrl);
    alert("Pairing URL copied to clipboard!");
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ textAlign: "center" }}>
        <h3>Scan to Pair</h3>
        <p>
          Scan this code with another device running Syncstuff to pair
          automatically.
        </p>

        {pairingUrl && (
          <div
            style={{
              background: "white",
              padding: "16px",
              display: "inline-block",
              borderRadius: "8px",
              marginTop: "8px",
            }}
          >
            <QRCodeCanvas value={pairingUrl} size={256} />
          </div>
        )}

        <div style={{ marginTop: "24px" }}>
          <IonButton expand="block" onClick={handleCopyUrl} fill="outline">
            <IonIcon slot="start" icon={copyOutline} />
            Copy Pairing URL
          </IonButton>

          <IonButton
            expand="block"
            fill="clear"
            color="medium"
            onClick={() => {
              if (navigator.share) {
                navigator
                  .share({
                    title: "Pair with my Syncstuff device",
                    url: pairingUrl,
                  })
                  .catch(console.error);
              }
            }}
          >
            <IonIcon slot="start" icon={shareOutline} />
            Share Link
          </IonButton>
        </div>

        <p
          style={{
            marginTop: "16px",
            fontSize: "0.8em",
            color: "var(--ion-color-medium)",
          }}
        >
          Device ID: {textToShow}
        </p>
      </IonContent>
    </IonModal>
  );
};
