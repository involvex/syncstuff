import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  checkmarkCircle,
  close,
  closeCircle,
  phonePortrait,
} from "ionicons/icons";
import type React from "react";
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
              className="pairing-device-icon"
              icon={phonePortrait}
              size="large"
            />

            <IonText>
              <h2>{device.name}</h2>
              <p className="device-platform">
                {device.platform.charAt(0).toUpperCase() +
                  device.platform.slice(1)}
              </p>
            </IonText>
          </div>

          <IonText className="pairing-message" color="medium">
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
            <IonButton color="success" expand="block" onClick={onAccept}>
              <IonIcon icon={checkmarkCircle} slot="start" />
              Accept & Pair
            </IonButton>

            <IonButton
              color="danger"
              expand="block"
              fill="outline"
              onClick={onReject}
            >
              <IonIcon icon={closeCircle} slot="start" />
              Reject
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
