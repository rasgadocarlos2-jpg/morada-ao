import { Platform } from "react-native";
import Constants from "expo-constants";

type Props = Record<string, string | number | boolean | null | undefined>;

const POSTHOG_API_KEY =
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY ??
  (Constants.expoConfig?.extra as any)?.posthogApiKey ??
  "";
const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ??
  (Constants.expoConfig?.extra as any)?.posthogHost ??
  "https://eu.i.posthog.com";

let posthog: any = null;
let firebaseAnalytics: any = null;
let firebaseCrashlytics: any = null;
let initialized = false;

async function tryInitPostHog() {
  if (!POSTHOG_API_KEY || Platform.OS === "web") return;
  try {
    const { PostHog } = require("posthog-react-native");
    posthog = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      enableSessionReplay: true,
      sessionReplayConfig: {
        maskAllTextInputs: true,
        maskAllImages: false,
        captureLog: false,
        captureNetworkTelemetry: true,
      },
      captureAppLifecycleEvents: true,
    });
  } catch (e) {
    if (__DEV__) console.warn("[analytics] posthog not available:", e);
  }
}

function tryInitFirebase() {
  if (Platform.OS === "web") return;
  try {
    firebaseAnalytics = require("@react-native-firebase/analytics").default();
  } catch (e) {
    if (__DEV__) console.warn("[analytics] firebase analytics not available");
  }
  try {
    firebaseCrashlytics = require("@react-native-firebase/crashlytics").default();
  } catch (e) {
    if (__DEV__) console.warn("[analytics] firebase crashlytics not available");
  }
}

export async function initAnalytics() {
  if (initialized) return;
  initialized = true;
  tryInitFirebase();
  await tryInitPostHog();
}

export function track(event: string, props: Props = {}) {
  if (__DEV__) console.log("[analytics]", event, props);
  try {
    posthog?.capture(event, props);
  } catch {}
  try {
    firebaseAnalytics?.logEvent(event, props);
  } catch {}
}

export function screen(name: string, props: Props = {}) {
  if (__DEV__) console.log("[analytics] screen", name, props);
  try {
    posthog?.screen(name, props);
  } catch {}
  try {
    firebaseAnalytics?.logScreenView({ screen_name: name, screen_class: name });
  } catch {}
}

export function identify(userId: string, props: Props = {}) {
  try {
    posthog?.identify(userId, props);
  } catch {}
  try {
    firebaseAnalytics?.setUserId(userId);
    Object.entries(props).forEach(([k, v]) => {
      if (v != null) firebaseAnalytics?.setUserProperty(k, String(v));
    });
  } catch {}
}

export function reset() {
  try {
    posthog?.reset();
  } catch {}
  try {
    firebaseAnalytics?.resetAnalyticsData();
  } catch {}
}

export function recordError(error: unknown, context?: string) {
  const err = error instanceof Error ? error : new Error(String(error));
  if (__DEV__) console.error("[analytics] error", context, err);
  try {
    if (context) firebaseCrashlytics?.log(context);
    firebaseCrashlytics?.recordError(err);
  } catch {}
  try {
    posthog?.capture("$exception", {
      $exception_message: err.message,
      $exception_type: err.name,
      $exception_stack_trace_raw: err.stack,
      context,
    });
  } catch {}
}
