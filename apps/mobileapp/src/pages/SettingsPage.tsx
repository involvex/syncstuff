import React, { useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useSettingsStore } from "../store/settings.store";
import { getPlatform } from "../utils/platform.utils";
import "./SettingsPage.css";
import pkg from "../../package.json";

import { CloudAccounts } from "../components/settings/CloudAccounts";
import { PermissionsSettings } from "../components/settings/PermissionsSettings";
import { NotificationSettings } from "../components/settings/NotificationSettings";
import { ElectronSettings } from "../components/settings/ElectronSettings";
import { ConnectionSettings } from "../components/settings/ConnectionSettings";
import { DebugSettings } from "../components/settings/DebugSettings";
import {
  Card,
  YStack,
  XStack,
  Text,
  Button,
  Separator,
  Switch,
  StatusBadge,
  ThemeToggle as TamaguiThemeToggle,
} from "@syncstuff/ui";

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

        <YStack space="$4" padding="$4" className="settings-container">
          <Card elevate bordered padding="$4">
            <YStack space="$4">
              <Text fontSize="$5" fontWeight="bold">
                Device Information
              </Text>
              <YStack separator={<Separator />}>
                <XStack
                  padding="$4"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text fontWeight="bold">Device Name</Text>
                  <Text color="$colorSubtitle">
                    {deviceName || "Loading..."}
                  </Text>
                </XStack>
                <YStack padding="$4" space="$1">
                  <Text fontWeight="bold">Device ID</Text>
                  <Text fontSize="$1" color="$colorSubtitle" fontFamily="$mono">
                    {deviceId || "Loading..."}
                  </Text>
                </YStack>
                <XStack
                  padding="$4"
                  justifyContent="space-between"
                  alignItems="center"
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

          <Card elevate bordered padding="$4">
            <YStack space="$4">
              <Text fontSize="$5" fontWeight="bold">
                Appearance & Debug
              </Text>
              <YStack separator={<Separator />}>
                <XStack
                  padding="$4"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text fontWeight="bold">Theme</Text>
                  <TamaguiThemeToggle />
                </XStack>
                <XStack
                  padding="$4"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <YStack flex={1} space="$1">
                    <Text fontWeight="bold">Developer Mode</Text>
                    <Text fontSize="$1" color="$colorSubtitle">
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

          <Card elevate bordered padding="$4">
            <YStack space="$4">
              <Text fontSize="$5" fontWeight="bold">
                About
              </Text>
              <YStack space="$2">
                <Text fontWeight="bold">Syncstuff</Text>
                <Text fontSize="$2">Version {pkg.version}</Text>
                <Text fontSize="$2" color="$colorSubtitle">
                  {pkg.description}
                </Text>
                <Separator marginVertical="$2" />
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$2" color="$colorSubtitle">
                    Author: {pkg.author.name}
                  </Text>
                  <Button
                    size="$2"
                    variant="outlined"
                    onPress={() => window.open(pkg.repository.url, "_blank")}
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
