import { v4 as uuidv4 } from 'uuid';

/**
 * Unique Entity ID using UUID
 */
export class UniqueEntityID {
  private value: string;

  constructor(id?: string) {
    this.value = id ?? uuidv4();
  }

  equals(id?: UniqueEntityID): boolean {
    if (id === null || id === undefined) {
      return false;
    }

    if (!(id instanceof UniqueEntityID)) {
      return false;
    }

    return id.toValue() === this.value;
  }

  toString(): string {
    return this.value;
  }

  toValue(): string {
    return this.value;
  }
}
