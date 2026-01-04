import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonTextarea,
  IonItem,
  IonLabel,
  IonButtons,
} from '@ionic/react';
import type { SignalMessage } from '../../types/network.types';

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
  const [pastedSignal, setPastedSignal] = useState('');

  useEffect(() => {
    // Clear pasted signal when modal re-opens
    if (isOpen) {
      setPastedSignal('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (pastedSignal.trim()) {
      onSignalSubmit(pastedSignal);
    }
  };

  const signalString = signalToShow ? JSON.stringify(signalToShow.data) : '';

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
          <IonTextarea
            value={signalString}
            readonly
            rows={6}
            autoGrow={true}
          ></IonTextarea>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">
            2. Paste the signal from the other device here
          </IonLabel>
          <IonTextarea
            placeholder="Paste signal here"
            value={pastedSignal}
            onIonChange={e => setPastedSignal(e.detail.value!)}
            rows={6}
            autoGrow={true}
          ></IonTextarea>
        </IonItem>

        <IonButton
          expand="block"
          onClick={handleSubmit}
          disabled={!pastedSignal.trim()}
          className="ion-margin-top"
        >
          Submit Signal
        </IonButton>
      </IonContent>
    </IonModal>
  );
};
