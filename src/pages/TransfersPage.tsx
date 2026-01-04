import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
} from "@ionic/react";
import "./TransfersPage.css";

const TransfersPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Transfers</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Transfers</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="transfers-container">
          <IonText>
            <p>File transfers will be implemented in Phase 3.</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TransfersPage;
