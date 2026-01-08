import { Share } from "@capacitor/share";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { copyOutline, link, qrCode, shareOutline } from "ionicons/icons";
import { QRCodeCanvas } from "qrcode.react";
import React, { useState } from "react";
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
  const [qrMode, setQrMode] = useState<"id" | "url">("id");
  const [present] = useIonToast();
  const pairingUrl = deepLinkService.generatePairingUrl();

  const showToast = (message: string) => {
    present({
      message,
      duration: 2000,
      position: "bottom",
    });
  };

  // For local scanning, use just the device ID
  // For sharing, use the full URL
  const qrValue = qrMode === "id" ? textToShow : pairingUrl;

  const handleCopyUrl = async () => {
    await clipboardService.writeText(pairingUrl);
    showToast("Pairing URL copied to clipboard!");
  };

  const handleCopyId = async () => {
    await clipboardService.writeText(textToShow);
    showToast("Device ID copied to clipboard!");
  };

  const handleShare = async () => {
    const canShare = await Share.canShare();

    if (canShare.value) {
      try {
        await Share.share({
          title: "Pair with my Syncstuff device",
          text: `Pair with my device using this link or enter ID: ${textToShow}`,
          url: pairingUrl,
          dialogTitle: "Share pairing link",
        });
      } catch (e) {
        console.error("Share failed:", e);
        // Fallback if user cancels or it fails
        if ((e as Error).message !== "Share canceled") {
          handleCopyUrl();
        }
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyUrl();
    }
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

        {/* Mode selector */}
        <IonSegment
          value={qrMode}
          onIonChange={e => setQrMode(e.detail.value as "id" | "url")}
          style={{ marginBottom: "16px" }}
        >
          <IonSegmentButton value="id">
            <IonIcon icon={qrCode} />
            <IonLabel>Device ID</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="url">
            <IonIcon icon={link} />
            <IonLabel>Web URL</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonText color="medium">
          <p style={{ fontSize: "0.85em", marginBottom: "8px" }}>
            {qrMode === "id"
              ? "For local device (Android/iOS) scanning"
              : "For sharing via link (opens web app)"}
          </p>
        </IonText>

        {qrValue && (
          <div
            style={{
              background: "white",
              padding: "16px",
              display: "inline-block",
              borderRadius: "8px",
              marginTop: "8px",
            }}
          >
            <QRCodeCanvas value={qrValue} size={256} />
          </div>
        )}

        <div style={{ marginTop: "24px" }}>
          {qrMode === "id" ? (
            <IonButton expand="block" onClick={handleCopyId} fill="outline">
              <IonIcon slot="start" icon={copyOutline} />
              Copy Device ID
            </IonButton>
          ) : (
            <IonButton expand="block" onClick={handleCopyUrl} fill="outline">
              <IonIcon slot="start" icon={copyOutline} />
              Copy Pairing URL
            </IonButton>
          )}

          <IonButton
            expand="block"
            fill="clear"
            color="medium"
            onClick={handleShare}
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
