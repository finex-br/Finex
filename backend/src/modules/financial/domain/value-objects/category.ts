import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';

interface CategoryProps {
  value: string;
}

/**
 * Category - Value Object
 * 
 * Representa uma categoria financeira.
 * Garante que categorias sejam sempre válidas e normalizadas.
 */
export class Category extends ValueObject<CategoryProps> {
  private constructor(props: CategoryProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Factory method para criar Category
   * 
   * @param value - Nome da categoria
   * @returns Result<Category>
   */
  public static create(value: string): Result<Category> {
    if (!value || value.trim().length === 0) {
      return Result.fail<Category>('Categoria não pode ser vazia');
    }

    if (value.trim().length > 100) {
      return Result.fail<Category>('Categoria muito longa (máximo 100 caracteres)');
    }

    // Normaliza: primeira letra maiúscula de cada palavra
    const normalized = value.trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return Result.ok<Category>(new Category({ value: normalized }));
  }
}
