import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  clipboard,
  phonePortrait,
  settings,
  swapHorizontal,
} from "ionicons/icons";
import { useEffect } from "react";
import { Redirect, Route } from "react-router-dom";
import { ResponsiveLayout } from "./components/common/ResponsiveLayout";
import { useTheme } from "./hooks/useTheme";
import ClipboardPage from "./pages/ClipboardPage";
import DevicesPage from "./pages/DevicesPage";
import SettingsPage from "./pages/SettingsPage";
import TransfersPage from "./pages/TransfersPage";
import { deviceDetectionService } from "./services/device/device-detection.service";
import { deepLinkService } from "./services/network/deeplink.service";
import { notificationService } from "./services/notifications/notification.service";
import { permissionsService } from "./services/permissions/permissions.service";
import { webrtcService } from "./services/network/webrtc.service";
import { useCloudStore } from "./store/cloud.store";
import { useSettingsStore } from "./store/settings.store";
import { isElectron } from "./utils/electron.utils";
import { PermissionRequestModal } from "./components/common/PermissionRequestModal";
import { useState } from "react";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.class.css'; */

/* Theme variables */
import "./theme/responsive.css";
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
  // Initialize theme
  useTheme();
  const { accounts } = useCloudStore();
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Initialize storage and settings
  useEffect(() => {
    const initializeAppSettings = async () => {
      await useSettingsStore.getState().initialize();
      await deepLinkService.initialize();

      // Initialize device detection
      try {
        await deviceDetectionService.initialize();
      } catch (error) {
        console.error("Failed to initialize device detection:", error);
      }

      // Initialize permissions service
      try {
        await permissionsService.initialize();
      } catch (error) {
        console.error("Failed to initialize permissions:", error);
      }

      // Initialize notification service
      try {
        await notificationService.initialize();
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }

      // Initialize remote action service (KDE Connect features)
      try {
        const { remoteActionService } =
          await import("./services/remote/remote-action.service");
        remoteActionService.initialize();
      } catch (error) {
        console.error("Failed to initialize remote actions:", error);
      }

      // Initialize Electron sync service if in Electron
      if (isElectron()) {
        try {
          const { electronSyncService } =
            await import("./services/electron/sync.service");
          await electronSyncService.initialize();
        } catch (error) {
          console.error("Failed to initialize Electron sync:", error);
        }
      }
      // Show permission modal if critical permissions are missing and not shown this session
      const permissionState = await permissionsService.getPermissionsState();
      const hasPrompted = sessionStorage.getItem(
        "syncstuff_permission_prompted",
      );

      const needsCritical =
        permissionState.camera.prompt ||
        permissionState.notifications.prompt ||
        permissionState.storage.prompt;

      if (needsCritical && !hasPrompted) {
        setShowPermissionModal(true);
        sessionStorage.setItem("syncstuff_permission_prompted", "true");
      }
    };
    initializeAppSettings();
  }, []);

  // Auto-detect device when user logs in with accounts
  useEffect(() => {
    if (accounts.length > 0) {
      // User has logged in, trigger device auto-registration
      deviceDetectionService.autoRegisterDevice().catch(error => {
        console.warn("Failed to auto-register device:", error);
      });
    }
  }, [accounts]);

  // Sync signaling server URL with WebRTC service
  const signalingUrl = useSettingsStore(state => state.signalingServerUrl);
  useEffect(() => {
    const { initialized } = useSettingsStore.getState();
    if (initialized) {
      webrtcService.updateSignalingServerUrl(signalingUrl);
    }
  }, [signalingUrl]);

  return (
    <IonApp>
      <ResponsiveLayout>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/devices">
                <DevicesPage />
              </Route>
              <Route exact path="/transfers">
                <TransfersPage />
              </Route>
              <Route exact path="/clipboard">
                <ClipboardPage />
              </Route>
              <Route exact path="/settings">
                <SettingsPage />
              </Route>
              <Route exact path="/">
                <Redirect to="/devices" />
              </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="devices" href="/devices">
                <IonIcon aria-hidden="true" icon={phonePortrait} />
                <IonLabel>Devices</IonLabel>
              </IonTabButton>
              <IonTabButton tab="transfers" href="/transfers">
                <IonIcon aria-hidden="true" icon={swapHorizontal} />
                <IonLabel>Transfers</IonLabel>
              </IonTabButton>
              <IonTabButton tab="clipboard" href="/clipboard">
                <IonIcon aria-hidden="true" icon={clipboard} />
                <IonLabel>Clipboard</IonLabel>
              </IonTabButton>
              <IonTabButton tab="settings" href="/settings">
                <IonIcon aria-hidden="true" icon={settings} />
                <IonLabel>Settings</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      </ResponsiveLayout>
      <PermissionRequestModal
        isOpen={showPermissionModal}
        onDismiss={() => setShowPermissionModal(false)}
      />
    </IonApp>
  );
};

export default App;
