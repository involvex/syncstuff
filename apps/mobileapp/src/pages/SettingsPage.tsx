import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import type React from "react";
import { useEffect } from "react";
import { useSettingsStore } from "../store/settings.store";
import { getPlatform } from "../utils/platform.utils";
import "./SettingsPage.css";
import {
  Button,
  Card,
  Separator,
  StatusBadge,
  Switch,
  ThemeToggle as TamaguiThemeToggle,
  Text,
  XStack,
  YStack,
} from "@syncstuff/ui";
import pkg from "../../package.json";
import { CloudAccounts } from "../components/settings/CloudAccounts";
import { ConnectionSettings } from "../components/settings/ConnectionSettings";
import { DebugSettings } from "../components/settings/DebugSettings";
import { ElectronSettings } from "../components/settings/ElectronSettings";
import { NotificationSettings } from "../components/settings/NotificationSettings";
import { PermissionsSettings } from "../components/settings/PermissionsSettings";

const SettingsPage: React.FC = () => {
  const { deviceName, deviceId, initialize, devMode, setDevMode } =
    useSettingsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <YStack className="settings-container" padding="$4" space="$4">
          <Card bordered elevate padding="$4">
            <YStack space="$4">
              <Text fontSize="$5" fontWeight="bold">
                Device Information
              </Text>
              <YStack separator={<Separator />}>
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  padding="$4"
                >
                  <Text fontWeight="bold">Device Name</Text>
                  <Text color="$colorSubtitle">
                    {deviceName || "Loading..."}
                  </Text>
                </XStack>
                <YStack padding="$4" space="$1">
                  <Text fontWeight="bold">Device ID</Text>
                  <Text color="$colorSubtitle" fontFamily="$mono" fontSize="$1">
                    {deviceId || "Loading..."}
                  </Text>
                </YStack>
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  padding="$4"
                >
                  <Text fontWeight="bold">Platform</Text>
                  <StatusBadge status="info">
                    {getPlatform().toUpperCase()}
                  </StatusBadge>
                </XStack>
              </YStack>
            </YStack>
          </Card>

          <CloudAccounts />

          <PermissionsSettings />

          <NotificationSettings />

          <ConnectionSettings />

          <ElectronSettings />

          <DebugSettings />

          <Card bordered elevate padding="$4">
            <YStack space="$4">
              <Text fontSize="$5" fontWeight="bold">
                Appearance & Debug
              </Text>
              <YStack separator={<Separator />}>
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  padding="$4"
                >
                  <Text fontWeight="bold">Theme</Text>
                  <TamaguiThemeToggle />
                </XStack>
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  padding="$4"
                >
                  <YStack flex={1} space="$1">
                    <Text fontWeight="bold">Developer Mode</Text>
                    <Text color="$colorSubtitle" fontSize="$1">
                      Enable advanced logging and controls
                    </Text>
                  </YStack>
                  <Switch checked={devMode} onCheckedChange={setDevMode}>
                    <Switch.Thumb animation="quick" />
                  </Switch>
                </XStack>
              </YStack>
            </YStack>
          </Card>

          <Card bordered elevate padding="$4">
            <YStack space="$4">
              <Text fontSize="$5" fontWeight="bold">
                About
              </Text>
              <YStack space="$2">
                <Text fontWeight="bold">Syncstuff</Text>
                <Text fontSize="$2">Version {pkg.version}</Text>
                <Text color="$colorSubtitle" fontSize="$2">
                  {pkg.description}
                </Text>
                <Separator marginVertical="$2" />
                <XStack alignItems="center" justifyContent="space-between">
                  <Text color="$colorSubtitle" fontSize="$2">
                    Author: {pkg.author.name}
                  </Text>
                  <Button
                    onPress={() => window.open(pkg.repository.url, "_blank")}
                    size="$2"
                    variant="outlined"
                  >
                    View Repository
                  </Button>
                </XStack>
              </YStack>
            </YStack>
          </Card>
        </YStack>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
