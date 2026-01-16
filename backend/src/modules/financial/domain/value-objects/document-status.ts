import { Result } from '../../../../shared/core/result';

/**
 * DocumentStatus - Value Object
 * 
 * Representa o status de um documento pendente no fluxo de processamento.
 */
export enum DocumentStatusEnum {
  UPLOADED = 'UPLOADED',
  MAPPED = 'MAPPED',
  VALIDATED = 'VALIDATED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class DocumentStatus {
  private constructor(private readonly _value: DocumentStatusEnum) {}

  get value(): DocumentStatusEnum {
    return this._value;
  }

  public static create(status: string): Result<DocumentStatus> {
    if (!Object.values(DocumentStatusEnum).includes(status as DocumentStatusEnum)) {
      return Result.fail<DocumentStatus>(
        `Status inválido: ${status}. Use: ${Object.values(DocumentStatusEnum).join(', ')}`,
      );
    }

    return Result.ok<DocumentStatus>(new DocumentStatus(status as DocumentStatusEnum));
  }

  public isUploaded(): boolean {
    return this._value === DocumentStatusEnum.UPLOADED;
  }

  public isMapped(): boolean {
    return this._value === DocumentStatusEnum.MAPPED;
  }

  public isValidated(): boolean {
    return this._value === DocumentStatusEnum.VALIDATED;
  }

  public isApproved(): boolean {
    return this._value === DocumentStatusEnum.APPROVED;
  }

  public isRejected(): boolean {
    return this._value === DocumentStatusEnum.REJECTED;
  }

  /**
   * Verifica se pode avançar para o próximo status
   */
  public canTransitionTo(newStatus: DocumentStatus): Result<void> {
    const transitions: Record<DocumentStatusEnum, DocumentStatusEnum[]> = {
      [DocumentStatusEnum.UPLOADED]: [DocumentStatusEnum.MAPPED, DocumentStatusEnum.REJECTED],
      [DocumentStatusEnum.MAPPED]: [DocumentStatusEnum.VALIDATED, DocumentStatusEnum.REJECTED],
      [DocumentStatusEnum.VALIDATED]: [DocumentStatusEnum.APPROVED, DocumentStatusEnum.REJECTED],
      [DocumentStatusEnum.APPROVED]: [], // Estado final
      [DocumentStatusEnum.REJECTED]: [], // Estado final
    };

    const allowedTransitions = transitions[this._value];
    
    if (!allowedTransitions.includes(newStatus.value)) {
      return Result.fail(
        `Transição inválida de ${this._value} para ${newStatus.value}`,
      );
    }

    return Result.ok();
  }

  public equals(other: DocumentStatus): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
