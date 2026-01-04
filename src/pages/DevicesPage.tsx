import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
} from "@ionic/react";
import "./DevicesPage.css";

const DevicesPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Devices</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Devices</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="devices-container">
          <IonText>
            <p>Device discovery and pairing will be implemented in Phase 2.</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DevicesPage;
