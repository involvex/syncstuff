import { Redirect, Route } from "react-router-dom";
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
  phonePortrait,
  swapHorizontal,
  clipboard,
  settings,
} from "ionicons/icons";
import DevicesPage from "./pages/DevicesPage";
import TransfersPage from "./pages/TransfersPage";
import ClipboardPage from "./pages/ClipboardPage";
import SettingsPage from "./pages/SettingsPage";
import { useTheme } from "./hooks/useTheme";
import { useEffect } from "react";
import { useSettingsStore } from "./store/settings.store"; // Import useSettingsStore

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.class.css'; */

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
  // Initialize theme
  useTheme();

  // Initialize storage and settings
  useEffect(() => {
    const initializeAppSettings = async () => {
      await useSettingsStore.getState().initialize();
      // Additional setup after settings are ready could go here
    };
    initializeAppSettings();
  }, []);

  return (
    <IonApp>
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
    </IonApp>
  );
};

export default App;
