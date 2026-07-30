import * as bcrypt from 'bcryptjs';
import { ValueObject } from '../../../../shared/domain/value-object.base';
import { Result } from '../../../../shared/domain/result';

interface PasswordProps {
  value: string;
  hashed?: boolean;
}

export class Password extends ValueObject<PasswordProps> {
  private constructor(props: PasswordProps) {
    super(props);
  }

  public get value(): string {
    return this.props.value;
  }

  public isAlreadyHashed(): boolean {
    return !!this.props.hashed;
  }

  public async comparePassword(plainText: string): Promise<boolean> {
    if (this.isAlreadyHashed()) {
      return bcrypt.compare(plainText, this.props.value);
    }
    return plainText === this.props.value;
  }

  public async getHashedValue(): Promise<string> {
    if (this.isAlreadyHashed()) {
      return this.props.value;
    }
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(this.props.value, salt);
  }

  public static create(password: string, hashed = false): Result<Password> {
    if (!hashed && (!password || password.length < 6)) {
      return Result.fail<Password>('Password must be at least 6 characters long');
    }
    return Result.ok<Password>(new Password({ value: password, hashed }));
  }
}
