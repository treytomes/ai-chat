import { http } from "@tauri-apps/api";
import {
  // CONSOLE_URL,
  Credentials,
  CredentialsDto,
  // DEFAULT_SESSION_DURATION,
  // FEDERATION_URL,
  FederationAction,
  FederationSigninTokenResponse,
  IdentityDto,
  // OAUTH_URL,
  OAuthAction,
  Profile,
} from "../models";
import { invoke } from "@tauri-apps/api/tauri";
import { delay } from "../util";
const FEDERATION_URL = "https://signin.aws.amazon.com/federation";
const CONSOLE_URL = "https://console.aws.amazon.com";
const DEFAULT_SESSION_DURATION = 12 * 60 * 60;
const OAUTH_URL = "https://signin.aws.amazon.com/oauth";
export const exportCredentials = async (
  profileName: string
): Promise<CredentialsDto> => {
  return await invoke("export_credentials", { profileName });
};

export const getCallerIdentity = async (
  profileName: string
): Promise<IdentityDto> => {
  return await invoke("get_caller_identity", { profileName });
};

export const listProfiles = async (): Promise<string[]> => {
  return await invoke("list_profiles");
};

export const login = async (profileName: string): Promise<string> => {
  return await invoke("login", { profileName });
};

export const openUrl = async (url: string): Promise<void> => {
  return await invoke("open_url", { url });
};

let lastProfileLogin: Profile | undefined = undefined;

export const getSigninToken = async (
  credentials: Credentials
): Promise<string> => {
  const action: FederationAction = "getSigninToken";

  const urlCredentials = credentials.toUrlCredentials();
  const requestParameters = `?Action=${action}&SessionDuration=${DEFAULT_SESSION_DURATION}&Session=${encodeURIComponent(
    JSON.stringify(urlCredentials)
  )}`;
  const requestUrl = `${FEDERATION_URL}${requestParameters}`;

  const response = await http.fetch(requestUrl);
  const data = response.data as FederationSigninTokenResponse;
  if (!data?.SigninToken) throw new Error("Failed to get signin token");
  return data.SigninToken;
};

export const logoutWebConsole = async () => {
  const action: OAuthAction = "logout";
  await openUrl(`${OAUTH_URL}?Action=${action}`);

  // A little delay to ensure the logout completes.
  // I haven't found a way to check the opened browser to see if the request is actually completed.
  await delay(500);
};

export const openWebConsole = async (profile: Profile) => {
  if (!profile.credentials) {
    throw new Error(`Profile ${profile.name} does not appear to be logged in.`);
  }

  const signinToken = await getSigninToken(profile.credentials);
  const action: FederationAction = "login";

  const requestParameters = new URLSearchParams({
    Action: action,
    Destination: CONSOLE_URL,
    SigninToken: signinToken,
    Issuer: "https://example.com",
  });

  if (lastProfileLogin !== undefined) {
    await logoutWebConsole();
  }
  lastProfileLogin = profile;

  const requestUrl = `${FEDERATION_URL}?${requestParameters}`;
  await openUrl(requestUrl);
};
