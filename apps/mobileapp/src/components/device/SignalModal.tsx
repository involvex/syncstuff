import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import type React from "react";
import { useEffect, useState } from "react";
import type { SignalMessage } from "../../types/network.types";

interface SignalModalProps {
  isOpen: boolean;
  signalToShow: SignalMessage | null;
  onDismiss: () => void;
  onSignalSubmit: (signal: string) => void;
}

export const SignalModal: React.FC<SignalModalProps> = ({
  isOpen,
  signalToShow,
  onDismiss,
  onSignalSubmit,
}) => {
  const [pastedSignal, setPastedSignal] = useState("");

  useEffect(() => {
    // Clear pasted signal when modal re-opens
    if (isOpen) {
      setPastedSignal("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (pastedSignal.trim()) {
      onSignalSubmit(pastedSignal);
    }
  };

  const signalString = signalToShow ? JSON.stringify(signalToShow.data) : "";

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manual Connection</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>
          To connect, copy the text from one device and paste it into the other.
        </p>

        <IonItem>
          <IonLabel position="stacked">1. Copy this signal</IonLabel>
          <IonTextarea autoGrow={true} readonly rows={6} value={signalString} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">
            2. Paste the signal from the other device here
          </IonLabel>
          <IonTextarea
            autoGrow={true}
            onIonChange={e => setPastedSignal(e.detail.value!)}
            placeholder="Paste signal here"
            rows={6}
            value={pastedSignal}
          />
        </IonItem>

        <IonButton
          className="ion-margin-top"
          disabled={!pastedSignal.trim()}
          expand="block"
          onClick={handleSubmit}
        >
          Submit Signal
        </IonButton>
      </IonContent>
    </IonModal>
  );
};
