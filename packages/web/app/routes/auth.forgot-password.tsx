import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  mailOutline,
} from "ionicons/icons";

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    return json({ success: false, error: "Email is required" });
  }

  try {
    const API_URL =
      context.cloudflare.env.API_URL ||
      "https://syncstuff-api.involvex.workers.dev";

    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const contentType = response.headers.get("Content-Type");
    let responseText = "";
    let data: { success: boolean; error?: string; message?: string };

    try {
      responseText = await response.text();

      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response from API:", responseText);
        return json({
          success: false,
          error: "Server returned invalid response. Please try again.",
        });
      }

      try {
        data = JSON.parse(responseText) as {
          success: boolean;
          error?: string;
          message?: string;
        };
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return json({
          success: false,
          error: "Server returned invalid response. Please try again.",
        });
      }
    } catch (textError) {
      console.error("Response text read error:", textError);
      return json({
        success: false,
        error: "Network error. Please try again.",
      });
    }

    // Always return success to prevent email enumeration
    // Even if user doesn't exist, show success message
    return json({
      success: true,
      message:
        "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return json({
      success: false,
      error:
        "Network error: " +
        (error instanceof Error ? error.message : "Unknown"),
    });
  }
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (actionData?.success) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Password Reset</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <IonIcon
              icon={checkmarkCircleOutline}
              style={{ fontSize: "64px", color: "var(--ion-color-success)" }}
            />
            <h2 className="mb-2 mt-4 text-2xl font-bold">Check Your Email</h2>
            <p className="mb-6 max-w-md text-center text-gray-600 dark:text-gray-400">
              {actionData.message}
            </p>
            <IonButton expand="block" routerLink="/auth/login">
              Back to Login
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton
            slot="start"
            fill="clear"
            routerLink="/auth/login"
            routerDirection="back"
          >
            <IonIcon icon={arrowBackOutline} slot="icon-only" />
          </IonButton>
          <IonTitle>Forgot Password</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="mx-auto mt-8 max-w-md">
          <div className="mb-8 text-center">
            <IonIcon
              icon={mailOutline}
              style={{ fontSize: "48px", color: "var(--ion-color-primary)" }}
            />
            <h1 className="mb-2 mt-4 text-2xl font-bold">Forgot Password?</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {actionData?.error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <IonIcon
                  icon={closeCircleOutline}
                  style={{ color: "var(--ion-color-danger)" }}
                />
                <IonText color="danger">{actionData.error}</IonText>
              </div>
            </div>
          )}

          <Form method="post">
            <IonItem>
              <IonIcon icon={mailOutline} slot="start" />
              <IonLabel position="stacked">Email Address</IonLabel>
              <IonInput
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                autocomplete="email"
              />
            </IonItem>

            <IonButton
              expand="block"
              type="submit"
              disabled={isSubmitting}
              className="mt-6"
            >
              {isSubmitting ? (
                <>
                  <IonSpinner name="crescent" slot="start" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </IonButton>
          </Form>

          <div className="mt-6 text-center">
            <IonText color="medium">
              Remember your password?{" "}
              <Link to="/auth/login" className="text-primary">
                Sign in
              </Link>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
