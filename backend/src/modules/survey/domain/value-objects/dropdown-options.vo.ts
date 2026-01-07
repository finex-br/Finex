import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';

interface DropdownOptionsProps {
  options: string[];
}

/**
 * DropdownOptions Value Object
 * Represents the available options for a dropdown question
 */
export class DropdownOptions extends ValueObject<DropdownOptionsProps> {
  private constructor(props: DropdownOptionsProps) {
    super(props);
  }

  get options(): string[] {
    return this.props.options;
  }

  public static create(options: string[]): Result<DropdownOptions> {
    if (!options || !Array.isArray(options)) {
      return Result.fail<DropdownOptions>('Options must be an array');
    }

    if (options.length === 0) {
      return Result.fail<DropdownOptions>('Dropdown must have at least one option');
    }

    // Filter out empty strings and trim
    const cleanedOptions = options
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);

    if (cleanedOptions.length === 0) {
      return Result.fail<DropdownOptions>('Dropdown must have at least one non-empty option');
    }

    // Check for duplicates
    const uniqueOptions = new Set(cleanedOptions);
    if (uniqueOptions.size !== cleanedOptions.length) {
      return Result.fail<DropdownOptions>('Dropdown options must be unique');
    }

    return Result.ok<DropdownOptions>(new DropdownOptions({ options: cleanedOptions }));
  }

  public contains(value: string): boolean {
    return this.options.includes(value);
  }

  public size(): number {
    return this.options.length;
  }
}
