import * as queries from "../queries";
import { Credentials } from "./credentials";
import { Identity } from "./identity";
import * as luxon from "luxon";

/**
 * An AWS SSO profile.
 */
export class Profile {
  readonly name: string;
  credentials?: Credentials;
  identity?: Identity;

  get isLoggedIn(): boolean {
    return (
      this.credentials?.expiration !== undefined &&
      this.credentials?.expiration > luxon.DateTime.now()
    );
  }

  private constructor(name: string) {
    this.name = name;
  }

  async loadCredentials(): Promise<Credentials> {
    try {
      if (!this.credentials) {
        this.credentials = new Credentials(
          await queries.exportCredentials(this.name)
        );
      }
      return this.credentials;
    } catch (e) {
      throw new Error(
        `Failed to load credentials for profile '${this.name}': ${e}`
      );
    }
  }

  async loadIdentity(): Promise<Identity> {
    try {
      if (!this.identity) {
        this.identity = new Identity(
          await queries.getCallerIdentity(this.name)
        );
      }
      console.log("identity", this.identity);
      return this.identity;
    } catch (e) {
      throw new Error(
        `Failed to load identity for profile '${this.name}': ${e}`
      );
    }
  }

  async login(): Promise<string> {
    try {
      const result = await queries.login(this.name);
      await this.loadCredentials();
      return result;
    } catch (e) {
      throw new Error(`Failed to login to profile '${this.name}': ${e}`);
    }
  }

  async openWebConsole(): Promise<void> {
    await queries.openWebConsole(this);
  }

  static async getAll(): Promise<Profile[]> {
    return (await queries.listProfiles())
      .map((name) => new Profile(name))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
