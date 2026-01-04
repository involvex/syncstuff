import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonText,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import {
  playCircle,
  stopCircle,
  phonePortrait,
  checkmarkCircle,
} from "ionicons/icons";
import { useDeviceDiscovery } from "../hooks/useDeviceDiscovery";
import { DeviceList } from "../components/device/DeviceList";
import { PairingModal } from "../components/device/PairingModal";
import type { Device } from "../types/device.types";
import "./DevicesPage.css";

const DevicesPage: React.FC = () => {
  const {
    currentDevice,
    discoveredDevices,
    pairedDevices,
    isDiscovering,
    isSupported,
    startDiscovery,
    stopDiscovery,
    pairDevice,
    unpairDevice,
    connectToDevice,
  } = useDeviceDiscovery();

  const [selectedTab, setSelectedTab] = useState<"discovered" | "paired">(
    "discovered",
  );
  const [pairingDevice, setPairingDevice] = useState<Device | null>(null);

  // Start discovery on mount
  useEffect(() => {
    if (isSupported && currentDevice) {
      startDiscovery();
    }

    return () => {
      stopDiscovery();
    };
  }, [isSupported, currentDevice, startDiscovery, stopDiscovery]);

  const handleStartDiscovery = async () => {
    await startDiscovery();
  };

  const handleStopDiscovery = async () => {
    await stopDiscovery();
  };

  const handlePairDevice = (device: Device) => {
    setPairingDevice(device);
  };

  const handleAcceptPairing = async () => {
    if (pairingDevice) {
      await pairDevice(pairingDevice);
      setPairingDevice(null);
    }
  };

  const handleRejectPairing = () => {
    setPairingDevice(null);
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await stopDiscovery();
    await startDiscovery();
    event.detail.complete();
  };

  const pairedDeviceIds = pairedDevices.map(d => d.id);

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

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="devices-page-container">
          {/* Current Device Info */}
          {currentDevice && (
            <IonCard className="current-device-card">
              <IonCardContent>
                <div className="current-device-info">
                  <IonIcon icon={phonePortrait} size="large" color="primary" />
                  <div>
                    <IonText>
                      <h3>This Device</h3>
                      <p>{currentDevice.name}</p>
                    </IonText>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {/* Platform Support Warning */}
          {!isSupported && (
            <IonCard color="warning">
              <IonCardContent>
                <IonText>
                  <p>
                    <strong>Web Platform Limitation:</strong> Device discovery
                    via mDNS is not supported on web browsers. Please use the
                    Android or iOS app for automatic device discovery, or
                    manually connect devices via pairing codes (coming in Phase
                    3).
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          )}

          {/* Discovery Controls */}
          {isSupported && (
            <div className="discovery-controls">
              {!isDiscovering ? (
                <IonButton expand="block" onClick={handleStartDiscovery}>
                  <IonIcon slot="start" icon={playCircle} />
                  Start Discovery
                </IonButton>
              ) : (
                <IonButton
                  expand="block"
                  color="danger"
                  onClick={handleStopDiscovery}
                >
                  <IonIcon slot="start" icon={stopCircle} />
                  Stop Discovery
                </IonButton>
              )}
            </div>
          )}

          {/* Segment Tabs */}
          <IonSegment
            value={selectedTab}
            onIonChange={e =>
              setSelectedTab(e.detail.value as "discovered" | "paired")
            }
          >
            <IonSegmentButton value="discovered">
              <IonLabel>Discovered ({discoveredDevices.length})</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="paired">
              <IonLabel>
                <IonIcon icon={checkmarkCircle} size="small" /> Paired (
                {pairedDevices.length})
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {/* Device Lists */}
          {selectedTab === "discovered" && (
            <DeviceList
              devices={discoveredDevices}
              pairedDeviceIds={pairedDeviceIds}
              onPair={handlePairDevice}
              emptyMessage={
                isDiscovering
                  ? "Searching for devices on your network..."
                  : "No devices found. Start discovery to find nearby devices."
              }
            />
          )}

          {selectedTab === "paired" && (
            <DeviceList
              devices={pairedDevices}
              pairedDeviceIds={pairedDeviceIds}
              onUnpair={unpairDevice}
              onConnect={connectToDevice}
              emptyMessage="No paired devices. Pair with a discovered device to get started."
            />
          )}
        </div>

        {/* Pairing Modal */}
        <PairingModal
          isOpen={pairingDevice !== null}
          device={pairingDevice}
          onAccept={handleAcceptPairing}
          onReject={handleRejectPairing}
          onDismiss={handleRejectPairing}
        />
      </IonContent>
    </IonPage>
  );
};

export default DevicesPage;
