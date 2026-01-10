import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import {
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  IonIcon,
  RefresherEventDetail,
} from "@ionic/react";
import { checkmarkCircle } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { AuthCodeModal } from "../components/device/AuthCodeModal";
import { DeviceList } from "../components/device/DeviceList";
import { PairingModal } from "../components/device/PairingModal";
import { QrCodeModal } from "../components/device/QrCodeModal";
import { useDeviceDiscovery } from "../hooks/useDeviceDiscovery";
import { useDeviceStore } from "../store/device.store";
import { useTransfer } from "../hooks/useTransfer";
import { authCodeService } from "../services/network/auth-code.service";
import { remoteActionService } from "../services/remote/remote-action.service";
import type { Device } from "../types/device.types";
import { isDesktop, isNative } from "../utils/platform.utils";
import {
  Card,
  YStack,
  XStack,
  Text,
  Button,
  DeviceIcon,
  StatusBadge,
  View,
} from "@syncstuff/ui";
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
  const [showAuthCodeModal, setShowAuthCodeModal] = useState(false);
  const [authCodeMode, setAuthCodeMode] = useState<"display" | "enter">(
    "display",
  );

  const pairingRequests = useDeviceStore(state => state.pairingRequests);
  const removePairingRequest = useDeviceStore(
    state => state.removePairingRequest,
  );

  // Auto-set pairing device if an inbound request arrives
  useEffect(() => {
    const pendingRequest = pairingRequests.find(r => r.status === "pending");
    if (pendingRequest && !pairingDevice) {
      setPairingDevice({
        id: pendingRequest.deviceId,
        name: pendingRequest.name,
        platform: pendingRequest.platform,
        status: "discovered",
        lastSeen: new Date(),
      });
    }
  }, [pairingRequests, pairingDevice]);

  // Stop discovery when the component unmounts
  useEffect(() => {
    return () => {
      stopDiscovery();
      // Only stop scanner on native platforms
      if (isNative()) {
        BarcodeScanner.stopScan().catch(() => {
          // Ignore errors - scanner might not be running
        });
      }
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
      // Remove any associated pairing request
      const request = pairingRequests.find(
        r => r.deviceId === pairingDevice.id,
      );
      if (request) {
        removePairingRequest(request.id);
      }
      setPairingDevice(null);
    }
  };

  const handleRejectPairing = () => {
    if (pairingDevice) {
      const request = pairingRequests.find(
        r => r.deviceId === pairingDevice.id,
      );
      if (request) {
        removePairingRequest(request.id);
      }
      setPairingDevice(null);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await stopDiscovery();
    await startDiscovery();
    event.detail.complete();
  };

  const handleAuthCodeEntered = async (code: string) => {
    if (!currentDevice) {
      alert("Device not initialized. Please restart the app.");
      return;
    }

    try {
      const result = await authCodeService.validateCode(code, currentDevice.id);

      if (result.valid && result.deviceId) {
        // Create device from the validated code
        const tempDevice: Device = {
          id: result.deviceId,
          name:
            result.deviceName || `Device ${result.deviceId.substring(0, 6)}`,
          platform: "android",
          status: "discovered",
          lastSeen: new Date(),
        };

        // Pair the device
        await pairDevice(tempDevice);

        // Show success
        alert(`Successfully paired with ${tempDevice.name}!`);

        // Switch to paired tab
        setSelectedTab("paired");

        // Try to connect
        try {
          connectToDevice(result.deviceId);
        } catch (e) {
          console.warn("Could not auto-connect after pairing:", e);
        }

        setShowAuthCodeModal(false);
      } else {
        alert(`Invalid code: ${result.reason || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error validating auth code:", error);
      alert("Failed to validate pairing code");
    }
  };

  const startScan = async () => {
    // Before starting a scan, remove the background
    document.querySelector("body")?.classList.add("scanner-active");

    try {
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

      // Start scanning - ML Kit BarcodeScanner.scan() has its own UI
      const { barcodes } = await BarcodeScanner.scan();

      // After scanning, restore the background
      document.querySelector("body")?.classList.remove("scanner-active");

      if (barcodes.length > 0 && barcodes[0].rawValue) {
        const scannedValue = barcodes[0].rawValue;
        console.log("Scanned QR value:", scannedValue);

        let deviceId: string;
        let deviceName: string;

        // Check if it's a URL or a direct device ID
        if (scannedValue.includes("://") || scannedValue.includes("/pair")) {
          // It's a URL, parse the parameters
          try {
            const url = new URL(scannedValue);
            const idParam = url.searchParams.get("id");
            const nameParam = url.searchParams.get("name");

            if (!idParam) {
              alert("Invalid pairing URL - no device ID found");
              return;
            }

            deviceId = idParam;
            deviceName = nameParam || `Device ${idParam.substring(0, 6)}`;
          } catch {
            alert("Could not parse pairing URL");
            return;
          }
        } else {
          // It's a direct device ID
          deviceId = scannedValue;
          deviceName = `Device ${scannedValue.substring(0, 6)}`;
        }

        // Don't pair with ourselves
        if (deviceId === currentDevice?.id) {
          alert("Cannot pair with yourself!");
          return;
        }

        // Create device object
        const tempDevice: Device = {
          id: deviceId,
          name: deviceName,
          platform: "android", // Assume mobile since using QR
          status: "discovered",
          lastSeen: new Date(),
        };

        // Pair the device
        await pairDevice(tempDevice);

        // Show success feedback
        alert(`Successfully paired with ${deviceName}!`);

        // Switch to paired tab to show the new device
        setSelectedTab("paired");

        // Try to connect (this may fail if signaling server isn't running)
        try {
          connectToDevice(deviceId);
        } catch (e) {
          console.warn("Could not auto-connect after pairing:", e);
        }
      } else {
        alert("No QR code found or scanned.");
      }
    } catch (error) {
      console.error("Scan error:", error);
      document.querySelector("body")?.classList.remove("scanner-active");
      alert(
        "Scan failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
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
            <Card elevate bordered padding="$4" marginBottom="$4">
              <YStack space="$4">
                <XStack space="$4" alignItems="center">
                  <View
                    backgroundColor="$primary"
                    padding="$4"
                    borderRadius="$3"
                  >
                    <DeviceIcon type="mobile" size={32} color="white" />
                  </View>
                  <YStack flex={1}>
                    <XStack space="$2" alignItems="center">
                      <Text
                        fontSize="$2"
                        color="$colorSubtitle"
                        textTransform="uppercase"
                        fontWeight="bold"
                      >
                        This Device
                      </Text>
                      <StatusBadge status="success">ONLINE</StatusBadge>
                    </XStack>
                    <Text fontSize="$6" fontWeight="bold">
                      {currentDevice.name}
                    </Text>
                  </YStack>
                </XStack>

                <YStack space="$2">
                  <XStack space="$2">
                    <Button
                      flex={1}
                      variant="outlined"
                      onPress={() => setShowQrModal(true)}
                      icon={<Text>QR</Text>}
                    >
                      Show QR
                    </Button>
                    <Button
                      flex={1}
                      variant="outlined"
                      onPress={startScan}
                      icon={<Text>🔍</Text>}
                    >
                      Scan QR
                    </Button>
                  </XStack>
                  <XStack space="$2">
                    <Button
                      flex={1}
                      variant="outlined"
                      onPress={() => {
                        setAuthCodeMode("display");
                        setShowAuthCodeModal(true);
                      }}
                      icon={<Text>⬆️</Text>}
                    >
                      Share Code
                    </Button>
                    <Button
                      flex={1}
                      variant="outlined"
                      onPress={() => {
                        setAuthCodeMode("enter");
                        setShowAuthCodeModal(true);
                      }}
                      icon={<Text>⬇️</Text>}
                    >
                      Enter Code
                    </Button>
                  </XStack>
                </YStack>
              </YStack>
            </Card>
          )}

          {/* Platform Support Warning */}
          {!isSupported && (
            <Card
              backgroundColor={isDesktop() ? "$blue4" : "$yellow4"}
              padding="$4"
              marginBottom="$4"
            >
              <Text
                color={isDesktop() ? "$blue10" : "$yellow10"}
                fontWeight="bold"
              >
                {isDesktop()
                  ? "Desktop Mode: Use auth code pairing or QR code scanning to connect to mobile devices."
                  : "Web Platform Limitation: Automatic discovery not supported. Use QR/Auth codes."}
              </Text>
            </Card>
          )}

          {/* Discovery Controls */}
          {isSupported && (
            <YStack marginBottom="$4">
              <Button
                theme={isDiscovering ? "red" : "blue"}
                size="$4"
                onPress={
                  isDiscovering ? handleStopDiscovery : handleStartDiscovery
                }
                icon={<Text fontSize="$5">{isDiscovering ? "⏹️" : "▶️"}</Text>}
              >
                {isDiscovering ? "Stop Discovery" : "Start Discovery"}
              </Button>
            </YStack>
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
              onPing={id => remoteActionService.sendPing(id)}
              onRing={id => remoteActionService.ringDevice(id)}
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

        {/* Auth Code Modal */}
        <AuthCodeModal
          isOpen={showAuthCodeModal}
          deviceId={currentDevice?.id || ""}
          mode={authCodeMode}
          onCodeEntered={handleAuthCodeEntered}
          onDismiss={() => setShowAuthCodeModal(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default DevicesPage;
