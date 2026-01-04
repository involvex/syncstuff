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
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import {
  playCircle,
  stopCircle,
  phonePortrait,
  checkmarkCircle,
  qrCode,
  scan,
} from "ionicons/icons";
import { useDeviceDiscovery } from "../hooks/useDeviceDiscovery";
import { useTransfer } from "../hooks/useTransfer";
import { DeviceList } from "../components/device/DeviceList";
import { PairingModal } from "../components/device/PairingModal";
import { QrCodeModal } from "../components/device/QrCodeModal";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
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
  const { sendFile } = useTransfer();

  const [selectedTab, setSelectedTab] = useState<"discovered" | "paired">(
    "discovered",
  );
  const [pairingDevice, setPairingDevice] = useState<Device | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Stop discovery when the component unmounts
  useEffect(() => {
    return () => {
      stopDiscovery();
      // Ensure scanner is stopped if component unmounts during scan
      BarcodeScanner.stopScan();
      document.querySelector("body")?.classList.remove("scanner-active");
    };
  }, [stopDiscovery]);

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

  const startScan = async () => {
    // Before starting a scan, remove the background
    // This allows the native camera view to show through
    // For ML Kit scanner, we actually want the UI to be hidden
    // The previous CSS for `body.scanner-active` makes the IonPage transparent.
    document.querySelector("body")?.classList.add("scanner-active");

    // Check permission
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera !== "granted") {
      const { camera: newPerm } = await BarcodeScanner.requestPermissions();
      if (newPerm !== "granted") {
        alert("Camera permission is required to scan QR codes.");
        document.querySelector("body")?.classList.remove("scanner-active");
        return;
      }
    }

    // Start scanning
    // ML Kit BarcodeScanner.scan() has its own UI
    const { barcodes } = await BarcodeScanner.scan();

    // After scanning, restore the background
    document.querySelector("body")?.classList.remove("scanner-active");

    if (barcodes.length > 0 && barcodes[0].rawValue) {
      const scannedDeviceId = barcodes[0].rawValue;

      // We need to create a temporary device object to pair with if not already paired
      const tempDevice: Device = {
        id: scannedDeviceId,
        name: `Device ${scannedDeviceId.substring(0, 6)}`, // Create a temporary name
        platform: "web", // Platform info unknown from QR, default to unknown
        status: "discovered",
        lastSeen: new Date(),
      };
      // Pair and connect
      await pairDevice(tempDevice);
      connectToDevice(scannedDeviceId);
    } else {
      alert("No QR code found or scanned.");
    }
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
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonButton
                        expand="block"
                        fill="outline"
                        onClick={() => setShowQrModal(true)}
                      >
                        <IonIcon slot="start" icon={qrCode} />
                        Show My Code
                      </IonButton>
                    </IonCol>
                    <IonCol>
                      <IonButton
                        expand="block"
                        fill="outline"
                        onClick={startScan}
                      >
                        <IonIcon slot="start" icon={scan} />
                        Scan Code
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          )}

          {/* Platform Support Warning */}
          {!isSupported && (
            <IonCard color="warning">
              <IonCardContent>
                <IonText>
                  <p>
                    <strong>Web Platform Limitation:</strong> Automatic device
                    discovery is not supported on web. Use QR code scanning to
                    connect to other devices.
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
              onSendFile={sendFile}
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

        {/* QR Code Modal */}
        <QrCodeModal
          isOpen={showQrModal}
          onDismiss={() => setShowQrModal(false)}
          textToShow={currentDevice?.id || ""}
          title="My Device ID"
        />
      </IonContent>
    </IonPage>
  );
};

export default DevicesPage;
