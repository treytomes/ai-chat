import { CredentialsDto } from "./credentials-dto";
import * as luxon from "luxon";
import { UrlCredentials } from "./federation";

export class Credentials {
  readonly version: number;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly sessionToken: string;
  readonly expiration: luxon.DateTime;

  constructor(dto: CredentialsDto) {
    this.version = dto.version;
    this.accessKeyId = dto.access_key_id;
    this.secretAccessKey = dto.secret_access_key;
    this.sessionToken = dto.session_token;
    this.expiration = luxon.DateTime.fromISO(dto.expiration);
  }

  toUrlCredentials(): UrlCredentials {
    return {
      sessionId: this.accessKeyId,
      sessionKey: this.secretAccessKey,
      sessionToken: this.sessionToken,
    };
  }
}
