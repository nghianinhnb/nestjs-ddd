import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class UniqueEntityID {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id ? id : uuidv4();
  }

  public toString(): string {
    return this.value;
  }

  public equals(id?: UniqueEntityID): boolean {
    if (id === null || id === undefined) {
      return false;
    }
    if (!(id instanceof UniqueEntityID)) {
      return false;
    }
    return id.toString() === this.value;
  }

  public static isValid(id: string): boolean {
    return uuidValidate(id);
  }
}
