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
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  lockClosedOutline,
} from "ionicons/icons";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  if (!token || !email) {
    return json({ error: "Missing reset token or email" }, { status: 400 });
  }

  return json({ token, email });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const token = formData.get("token");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirm_password");

  if (!token || !email || !password || !confirmPassword) {
    return json({ success: false, error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return json({ success: false, error: "Passwords do not match" });
  }

  if (typeof password !== "string" || password.length < 8) {
    return json({
      success: false,
      error: "Password must be at least 8 characters long",
    });
  }

  try {
    const API_URL =
      context.cloudflare.env.API_URL ||
      "https://syncstuff-api.involvex.workers.dev";

    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        email,
        newPassword: password,
      }),
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

    if (!response.ok || !data.success) {
      return json({
        success: false,
        error: data.error || "Failed to reset password",
      });
    }

    return json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return json({
      success: false,
      error:
        "Network error: " +
        (error instanceof Error ? error.message : "Unknown"),
    });
  }
}

export default function ResetPassword() {
  const loaderData = useLoaderData<typeof loader>();
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
            <h2 className="mb-2 mt-4 text-2xl font-bold">Success!</h2>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
              {actionData.message}
            </p>
            <IonButton expand="block" routerLink="/auth/login">
              Go to Login
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
          <IonTitle>Reset Password</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="mx-auto mt-8 max-w-md">
          <div className="mb-8 text-center">
            <IonIcon
              icon={lockClosedOutline}
              style={{ fontSize: "48px", color: "var(--ion-color-primary)" }}
            />
            <h1 className="mb-2 mt-4 text-2xl font-bold">
              Reset Your Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your new password below
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
            <input type="hidden" name="token" value={loaderData.token || ""} />
            <input type="hidden" name="email" value={loaderData.email || ""} />

            <IonItem>
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonLabel position="stacked">New Password</IonLabel>
              <IonInput
                type="password"
                name="password"
                required
                minlength={8}
                placeholder="Enter new password"
                autocomplete="new-password"
              />
            </IonItem>

            <IonItem>
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonLabel position="stacked">Confirm Password</IonLabel>
              <IonInput
                type="password"
                name="confirm_password"
                required
                minlength={8}
                placeholder="Confirm new password"
                autocomplete="new-password"
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
                  Resetting...
                </>
              ) : (
                "Reset Password"
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
