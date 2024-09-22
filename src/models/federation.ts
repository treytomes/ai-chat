export const DEFAULT_SESSION_DURATION = 12 * 60 * 60;

export const CONSOLE_URL = "https://console.aws.amazon.com";
export const FEDERATION_URL = "https://signin.aws.amazon.com/federation";
export const OAUTH_URL = "https://signin.aws.amazon.com/oauth";

export type FederationAction = "getSigninToken" | "login";
export type OAuthAction = "logout";

export type FederationSigninTokenResponse = {
  SigninToken: string;
};

export type UrlCredentials = {
  sessionId: string;
  sessionKey: string;
  sessionToken: string;
};
