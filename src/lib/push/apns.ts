import { createPrivateKey, createSign } from "node:crypto";

type APNSConfig = {
  teamId: string;
  keyId: string;
  bundleId: string;
  privateKey: string;
  useSandbox: boolean;
};

type APNSPayload = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sandbox?: boolean;
};

type APNSResult = {
  ok: boolean;
  shouldDeactivateToken?: boolean;
  reason?: string;
  status?: number;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

const base64url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const getConfig = (): APNSConfig | null => {
  const teamId = process.env.APNS_TEAM_ID?.trim();
  const keyId = process.env.APNS_KEY_ID?.trim();
  const bundleId = process.env.APNS_BUNDLE_ID?.trim();
  const privateKeyRaw = process.env.APNS_PRIVATE_KEY?.trim();
  const useSandbox = (process.env.APNS_USE_SANDBOX ?? "false").toLowerCase() === "true";

  if (!teamId || !keyId || !bundleId || !privateKeyRaw) {
    return null;
  }

  return {
    teamId,
    keyId,
    bundleId,
    privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
    useSandbox,
  };
};

const createProviderToken = (config: APNSConfig) => {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  const header = { alg: "ES256", kid: config.keyId };
  const payload = { iss: config.teamId, iat: now };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("sha256");
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign({
    key: createPrivateKey(config.privateKey),
    dsaEncoding: "ieee-p1363",
  });

  const token = `${signingInput}.${base64url(signature)}`;
  cachedToken = { token, expiresAt: now + 50 * 60 };
  return token;
};

export const sendAPNSNotification = async (
  deviceToken: string,
  payload: APNSPayload
): Promise<APNSResult> => {
  const config = getConfig();
  if (!config) {
    return { ok: false, reason: "APNS_NOT_CONFIGURED" };
  }

  const providerToken = createProviderToken(config);
  const sandbox = payload.sandbox ?? config.useSandbox;
  const host = sandbox ? "https://api.sandbox.push.apple.com" : "https://api.push.apple.com";
  const url = `${host}/3/device/${deviceToken}`;

  const body = {
    aps: {
      alert: {
        title: payload.title,
        body: payload.body,
      },
      sound: "default",
    },
    ...(payload.data ?? {}),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `bearer ${providerToken}`,
      "apns-topic": config.bundleId,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 200) {
    return { ok: true, status: response.status };
  }

  let reason: string | undefined;
  try {
    const json = (await response.json()) as { reason?: string };
    reason = json.reason;
  } catch {
    reason = undefined;
  }

  const deactivateReasons = new Set(["BadDeviceToken", "Unregistered", "DeviceTokenNotForTopic"]);
  return {
    ok: false,
    status: response.status,
    reason,
    shouldDeactivateToken: reason ? deactivateReasons.has(reason) : response.status === 410,
  };
};
