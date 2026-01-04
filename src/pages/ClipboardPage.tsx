import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
} from "@ionic/react";
import "./ClipboardPage.css";

const ClipboardPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Clipboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Clipboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="clipboard-container">
          <IonText>
            <p>Clipboard sync will be implemented in Phase 4 (post-MVP).</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ClipboardPage;
