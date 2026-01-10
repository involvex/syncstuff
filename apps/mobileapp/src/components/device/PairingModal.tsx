import React from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText,
  IonIcon,
  IonButtons,
} from "@ionic/react";
import {
  close,
  phonePortrait,
  checkmarkCircle,
  closeCircle,
} from "ionicons/icons";
import type { Device } from "../../types/device.types";
import "./PairingModal.css";

interface PairingModalProps {
  isOpen: boolean;
  device: Device | null;
  onAccept: () => void;
  onReject: () => void;
  onDismiss: () => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  isOpen,
  device,
  onAccept,
  onReject,
  onDismiss,
}) => {
  if (!device) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pair Device</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="pairing-modal-content">
        <div className="pairing-container">
          <div className="pairing-device-info">
            <IonIcon
              icon={phonePortrait}
              size="large"
              className="pairing-device-icon"
            />

            <IonText>
              <h2>{device.name}</h2>
              <p className="device-platform">
                {device.platform.charAt(0).toUpperCase() +
                  device.platform.slice(1)}
              </p>
            </IonText>
          </div>

          <IonText color="medium" className="pairing-message">
            <p>
              Do you want to pair with this device? Once paired, you'll be able
              to transfer files and sync clipboard content.
            </p>
          </IonText>

          {device.ipAddress && (
            <div className="pairing-details">
              <IonText color="medium">
                <p>
                  <strong>IP Address:</strong> {device.ipAddress}
                </p>
              </IonText>
            </div>
          )}

          <div className="pairing-actions">
            <IonButton expand="block" onClick={onAccept} color="success">
              <IonIcon slot="start" icon={checkmarkCircle} />
              Accept & Pair
            </IonButton>

            <IonButton
              expand="block"
              onClick={onReject}
              color="danger"
              fill="outline"
            >
              <IonIcon slot="start" icon={closeCircle} />
              Reject
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
