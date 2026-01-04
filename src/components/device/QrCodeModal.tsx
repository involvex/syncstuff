import React from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
} from "@ionic/react";
import { QRCodeCanvas } from "qrcode.react";

interface QrCodeModalProps {
  isOpen: boolean;
  textToShow: string;
  title?: string;
  onDismiss: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  textToShow,
  title = "Scan QR Code",
  onDismiss,
}) => {
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
        <h3>Scan this code with another device</h3>
        {textToShow && (
          <div
            style={{
              background: "white",
              padding: "16px",
              display: "inline-block",
            }}
          >
            <QRCodeCanvas value={textToShow} size={256} />
          </div>
        )}
        <p style={{ marginTop: "16px", wordBreak: "break-all" }}>
          Or manually copy ID: {textToShow}
        </p>
      </IonContent>
    </IonModal>
  );
};
