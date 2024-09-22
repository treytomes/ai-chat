import { IdentityDto } from "./identity-dto";

export class Identity {
  readonly userId: string;
  readonly account: string;
  readonly arn: string;

  constructor(dto: IdentityDto) {
    this.userId = dto.user_id;
    this.account = dto.account;
    this.arn = dto.arn;
  }
}
