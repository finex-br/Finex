# Survey Module - Guia de Implementação Rápida

Este guia mostra os próximos passos para continuar a implementação do módulo Survey.

## 📦 Estrutura já Criada

```
backend/src/modules/survey/
├── domain/
│   ├── entities/          ✅ 5/5 completo
│   ├── value-objects/     ✅ 4/4 completo
│   └── repositories/      ✅ 5/5 interfaces completas
├── infrastructure/
│   └── database/
│       ├── entities/      ✅ 5/5 schemas completos
│       ├── mappers/       ⚠️ 1/5 completo
│       └── repositories/  ⚠️ 1/5 completo
├── application/
│   └── use-cases/         ⚠️ 1/9 completo
├── presentation/
│   ├── controllers/       ⚠️ Esqueletos criados
│   └── dtos/              ⚠️ 1/8 completo
├── survey.module.ts       ✅ Criado
└── README.md              ✅ Documentado
```

## 🔄 Próximo Use Case a Implementar: StartAssessmentUseCase

### 1. Criar o Use Case (com TDD)

**Arquivo**: `application/use-cases/start-assessment/start-assessment.use-case.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Result } from '../../../../../shared/core/result';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { Assessment } from '../../../domain/entities/assessment.entity';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';

export interface StartAssessmentRequest {
  userId: string;
  companyId: string;
  surveyId: string;
}

export interface StartAssessmentResponse {
  assessmentId: string;
  surveyTitle: string;
  totalQuestions: number;
  currentProgress: number;
  isResuming: boolean;
}

@Injectable()
export class StartAssessmentUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly surveyVersionRepository: ISurveyVersionRepository,
    // Inject outros repositórios necessários
  ) {}

  async execute(request: StartAssessmentRequest): Promise<Result<StartAssessmentResponse>> {
    // 1. Validar permissões (usuário é OWNER da company)
    // 2. Buscar versão mais recente do survey
    // 3. Verificar se já existe assessment para essa versão
    // 4. Se existe, retornar assessment existente (resume)
    // 5. Se não existe, criar novo assessment
    // 6. Retornar dados do assessment
    
    // TODO: Implementar lógica
    throw new Error('Not implemented');
  }
}
```

**Arquivo**: `application/use-cases/start-assessment/start-assessment.use-case.spec.ts`

```typescript
import { StartAssessmentUseCase } from './start-assessment.use-case';
// Import mocks and dependencies

describe('StartAssessmentUseCase', () => {
  let useCase: StartAssessmentUseCase;
  // Declare mocked repositories

  beforeEach(() => {
    // Setup mocks
  });

  it('should create a new assessment when none exists', async () => {
    // RED: Write test first
    // Then implement code to make it pass (GREEN)
  });

  it('should resume existing assessment', async () => {
    // Test resume logic
  });

  it('should fail when user is not OWNER', async () => {
    // Test authorization
  });

  // More tests...
});
```

### 2. Criar o Mapper

**Arquivo**: `infrastructure/database/mappers/assessment.mapper.ts`

```typescript
import { Assessment } from '../../../domain/entities/assessment.entity';
import { AssessmentSchema } from '../entities/assessment.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { AssessmentStatus } from '../../../domain/value-objects/assessment-status.vo';

export class AssessmentMapper {
  public static toDomain(schema: AssessmentSchema): Assessment {
    const statusOrError = AssessmentStatus.create(schema.status);
    if (statusOrError.isFailure) {
      throw new Error(statusOrError.error);
    }

    const assessmentOrError = Assessment.create(
      {
        companyId: new UniqueEntityID(schema.companyId),
        surveyVersionId: new UniqueEntityID(schema.surveyVersionId),
        status: statusOrError.getValue(),
        finalScore: schema.finalScore,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );

    if (assessmentOrError.isFailure) {
      throw new Error(assessmentOrError.error);
    }

    return assessmentOrError.getValue();
  }

  public static toPersistence(assessment: Assessment): AssessmentSchema {
    const schema = new AssessmentSchema();
    schema.id = assessment.id.toString();
    schema.companyId = assessment.companyId.toString();
    schema.surveyVersionId = assessment.surveyVersionId.toString();
    schema.status = assessment.status.value;
    schema.finalScore = assessment.finalScore;
    schema.createdAt = assessment.createdAt;
    schema.updatedAt = assessment.updatedAt;
    return schema;
  }
}
```

### 3. Criar o Repository

**Arquivo**: `infrastructure/database/repositories/typeorm-assessment.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';
import { Assessment } from '../../../domain/entities/assessment.entity';
import { AssessmentSchema } from '../entities/assessment.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { AssessmentMapper } from '../mappers/assessment.mapper';

@Injectable()
export class TypeORMAssessmentRepository implements IAssessmentRepository {
  constructor(
    @InjectRepository(AssessmentSchema)
    private readonly assessmentRepository: Repository<AssessmentSchema>,
  ) {}

  async save(assessment: Assessment): Promise<void> {
    const schema = AssessmentMapper.toPersistence(assessment);
    await this.assessmentRepository.save(schema);
  }

  async findById(id: UniqueEntityID): Promise<Assessment | null> {
    const schema = await this.assessmentRepository.findOne({ 
      where: { id: id.toString() } 
    });
    return schema ? AssessmentMapper.toDomain(schema) : null;
  }

  async findByCompanyAndSurveyVersion(
    companyId: UniqueEntityID,
    surveyVersionId: UniqueEntityID,
  ): Promise<Assessment | null> {
    const schema = await this.assessmentRepository.findOne({
      where: {
        companyId: companyId.toString(),
        surveyVersionId: surveyVersionId.toString(),
      },
    });
    return schema ? AssessmentMapper.toDomain(schema) : null;
  }

  async findByCompanyId(companyId: UniqueEntityID): Promise<Assessment[]> {
    const schemas = await this.assessmentRepository.find({
      where: { companyId: companyId.toString() },
      order: { createdAt: 'DESC' },
    });
    return schemas.map(AssessmentMapper.toDomain);
  }

  async findAll(filters?: { 
    companyId?: string; 
    surveyId?: string; 
    status?: string;
  }): Promise<Assessment[]> {
    const where: any = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.status) where.status = filters.status;
    
    const schemas = await this.assessmentRepository.find({ 
      where,
      order: { createdAt: 'DESC' },
    });
    return schemas.map(AssessmentMapper.toDomain);
  }

  async exists(
    companyId: UniqueEntityID,
    surveyVersionId: UniqueEntityID,
  ): Promise<boolean> {
    const count = await this.assessmentRepository.count({
      where: {
        companyId: companyId.toString(),
        surveyVersionId: surveyVersionId.toString(),
      },
    });
    return count > 0;
  }
}
```

### 4. Registrar no Módulo

**Arquivo**: `survey.module.ts`

```typescript
@Module({
  // ... imports existentes
  providers: [
    // Repositories
    {
      provide: 'ISurveyRepository',
      useClass: TypeORMSurveyRepository,
    },
    {
      provide: 'IAssessmentRepository',
      useClass: TypeORMAssessmentRepository,
    },
    // ... outros repositories
    
    // Use Cases
    {
      provide: CreateSurveyUseCase,
      useFactory: (surveyRepo: ISurveyRepository) => {
        return new CreateSurveyUseCase(surveyRepo);
      },
      inject: ['ISurveyRepository'],
    },
    {
      provide: StartAssessmentUseCase,
      useFactory: (
        assessmentRepo: IAssessmentRepository,
        surveyVersionRepo: ISurveyVersionRepository,
      ) => {
        return new StartAssessmentUseCase(assessmentRepo, surveyVersionRepo);
      },
      inject: ['IAssessmentRepository', 'ISurveyVersionRepository'],
    },
    // ... outros use cases
  ],
})
export class SurveyModule {}
```

### 5. Adicionar Endpoint no Controller

**Arquivo**: `presentation/controllers/user-survey.controller.ts`

```typescript
@Controller('surveys')
export class UserSurveyController {
  constructor(
    private readonly startAssessmentUseCase: StartAssessmentUseCase,
  ) {}

  @Post(':surveyId/start')
  @ApiOperation({ summary: 'Start or resume an assessment' })
  async startAssessment(
    @Param('surveyId') surveyId: string,
    @Request() req: any, // Get user from JWT
  ) {
    const result = await this.startAssessmentUseCase.execute({
      userId: req.user.id,
      companyId: req.user.companyId,
      surveyId: surveyId,
    });

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }
}
```

## 🎯 Ordem Recomendada de Implementação

### Sprint 1: Core de Avaliações (2-3 dias)
1. ✅ **Mappers restantes**
   - AssessmentMapper
   - AnswerMapper
   - QuestionMapper
   - SurveyVersionMapper

2. ✅ **Repositories restantes**
   - TypeORMAssessmentRepository
   - TypeORMAnswerRepository
   - TypeORMQuestionRepository
   - TypeORMSurveyVersionRepository

3. ✅ **Use Cases principais**
   - StartAssessmentUseCase
   - SubmitAnswersUseCase
   - CompleteAssessmentUseCase
   - GetAssessmentProgressUseCase

### Sprint 2: Admin e Versionamento (1-2 dias)
4. ✅ **Use Cases de Admin**
   - UpdateSurveyUseCase
   - CreateSurveyVersionUseCase
   - GetAssessmentDetailsUseCase

5. ✅ **Use Cases de Listagem**
   - GetPendingAssessmentsUseCase

6. ✅ **Controllers completos**
   - Todos os endpoints documentados
   - Guards de autenticação
   - Swagger documentation

### Sprint 3: Frontend (3-4 dias)
7. ✅ **Services e Types**
   - surveyService.ts
   - survey.types.ts

8. ✅ **Hooks**
   - useSurveyResponse
   - useSurveyNavigation
   - useSurveyUpload

9. ✅ **Components**
   - Componentes de pergunta
   - SurveyProgress
   - SurveyNavigation

10. ✅ **Views e Routing**
    - SurveyResponseView
    - Integração com router

## 📊 Checklist Detalhado

### Backend Infrastructure
- [ ] AssessmentMapper
- [ ] AnswerMapper
- [ ] QuestionMapper
- [ ] SurveyVersionMapper
- [ ] TypeORMAssessmentRepository
- [ ] TypeORMAnswerRepository
- [ ] TypeORMQuestionRepository
- [ ] TypeORMSurveyVersionRepository

### Backend Use Cases
- [ ] StartAssessmentUseCase + tests
- [ ] SubmitAnswersUseCase + tests
- [ ] CompleteAssessmentUseCase + tests
- [ ] GetAssessmentProgressUseCase + tests
- [ ] UpdateSurveyUseCase + tests
- [ ] CreateSurveyVersionUseCase + tests
- [ ] GetPendingAssessmentsUseCase + tests
- [ ] GetAssessmentDetailsUseCase + tests

### Backend Presentation
- [ ] Todos os DTOs
- [ ] AdminSurveyController completo
- [ ] UserSurveyController completo
- [ ] Guards (Admin, Owner)
- [ ] Swagger documentation

### Frontend
- [ ] Types e interfaces
- [ ] surveyService.ts
- [ ] useSurveyResponse hook
- [ ] useSurveyNavigation hook
- [ ] useSurveyUpload hook
- [ ] Todos os componentes
- [ ] SurveyResponseView
- [ ] Routing

### Tests
- [ ] Unit tests (100% cobertura)
- [ ] Integration tests
- [ ] E2E tests

## 💡 Dicas

1. **Sempre seguir TDD**: Teste → Implementação → Refatoração
2. **Commits pequenos e frequentes**: Um feature por commit
3. **Revisar o plano**: Ver `docs/survey-implementation-plan.md` para detalhes
4. **Atualizar README**: Manter progresso documentado

## 🚀 Para Começar Agora

```bash
# 1. Criar próximo mapper
touch backend/src/modules/survey/infrastructure/database/mappers/assessment.mapper.ts

# 2. Criar próximo repository
touch backend/src/modules/survey/infrastructure/database/repositories/typeorm-assessment.repository.ts

# 3. Criar próximo use case com testes
mkdir -p backend/src/modules/survey/application/use-cases/start-assessment
touch backend/src/modules/survey/application/use-cases/start-assessment/start-assessment.use-case.ts
touch backend/src/modules/survey/application/use-cases/start-assessment/start-assessment.use-case.spec.ts

# 4. Rodar testes
npm test
```

---

**Boa sorte com a implementação! 🎉**
