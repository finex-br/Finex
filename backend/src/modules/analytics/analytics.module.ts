import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { EnvService } from '../../shared/infra/env/env.service';

// Schemas
import { DatasetSchema } from './infrastructure/persistence/typeorm/dataset.schema';
import { DatasetRowSchema } from './infrastructure/persistence/typeorm/dataset-row.schema';
import { ChartConfigSchema } from './infrastructure/persistence/typeorm/chart-config.schema';
import { DashboardSchema } from './infrastructure/persistence/typeorm/dashboard.schema';
import { UserSchema } from '../authentication/infrastructure/persistence/typeorm/entities/user.schema';

// Repositories
import { TypeormDatasetRepository } from './infrastructure/persistence/typeorm/typeorm-dataset.repository';
import { TypeormDatasetRowsRepository } from './infrastructure/persistence/typeorm/typeorm-dataset-rows.repository';
import { TypeormChartConfigRepository } from './infrastructure/persistence/typeorm/typeorm-chart-config.repository';
import { TypeormDashboardRepository } from './infrastructure/persistence/typeorm/typeorm-dashboard.repository';

// Adapters
import { PostgresAnalyticsEngineAdapter } from './infrastructure/adapters/postgres-analytics-engine.adapter';
import { CsvParserAdapter } from './infrastructure/adapters/csv-parser.adapter';

// Use Cases
import { UploadDatasetUseCase } from './application/use-cases/upload-dataset.use-case';
import { GetDatasetsUseCase } from './application/use-cases/get-datasets.use-case';
import { GetDatasetPreviewUseCase } from './application/use-cases/get-dataset-preview.use-case';
import { ReuploadDatasetUseCase } from './application/use-cases/reupload-dataset.use-case';
import { DeleteDatasetUseCase } from './application/use-cases/delete-dataset.use-case';
import { DownloadDatasetUseCase } from './application/use-cases/download-dataset.use-case';
import { ExecuteQueryUseCase } from './application/use-cases/execute-query.use-case';
import { CreateChartUseCase } from './application/use-cases/create-chart.use-case';
import { UpdateChartUseCase } from './application/use-cases/update-chart.use-case';
import { DeleteChartUseCase } from './application/use-cases/delete-chart.use-case';
import { GetChartDataUseCase } from './application/use-cases/get-chart-data.use-case';
import { CreateDashboardUseCase } from './application/use-cases/create-dashboard.use-case';
import { UpdateDashboardUseCase } from './application/use-cases/update-dashboard.use-case';
import { DeleteDashboardUseCase } from './application/use-cases/delete-dashboard.use-case';
import { GetDashboardUseCase } from './application/use-cases/get-dashboard.use-case';

// Controllers
import { DatasetController } from './presentation/controllers/dataset.controller';
import { ChartController } from './presentation/controllers/chart.controller';
import { DashboardController } from './presentation/controllers/dashboard.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.jwtSecret,
        signOptions: {
          expiresIn: envService.jwtExpiresIn as any,
        },
      }),
    }),
    TypeOrmModule.forFeature([
      DatasetSchema,
      DatasetRowSchema,
      ChartConfigSchema,
      DashboardSchema,
      UserSchema,
    ]),
  ],
  controllers: [
    DatasetController,
    ChartController,
    DashboardController,
  ],
  providers: [
    // Adapters
    CsvParserAdapter,
    {
      provide: 'IAnalyticsEngine',
      useFactory: (dataSource: DataSource) => {
        return new PostgresAnalyticsEngineAdapter(dataSource);
      },
      inject: [DataSource],
    },

    // Repositories
    {
      provide: 'IDatasetRepository',
      useClass: TypeormDatasetRepository,
    },
    {
      provide: 'IDatasetRowsRepository',
      useClass: TypeormDatasetRowsRepository,
    },
    {
      provide: 'IChartConfigRepository',
      useClass: TypeormChartConfigRepository,
    },
    {
      provide: 'IDashboardRepository',
      useClass: TypeormDashboardRepository,
    },

    // Use Cases - Datasets
    {
      provide: UploadDatasetUseCase,
      useFactory: (datasetRepo, rowsRepo, csvParser) => {
        return new UploadDatasetUseCase(datasetRepo, rowsRepo, csvParser);
      },
      inject: ['IDatasetRepository', 'IDatasetRowsRepository', CsvParserAdapter],
    },
    {
      provide: GetDatasetsUseCase,
      useFactory: (datasetRepo) => {
        return new GetDatasetsUseCase(datasetRepo);
      },
      inject: ['IDatasetRepository'],
    },
    {
      provide: GetDatasetPreviewUseCase,
      useFactory: (datasetRepo, rowsRepo) => {
        return new GetDatasetPreviewUseCase(datasetRepo, rowsRepo);
      },
      inject: ['IDatasetRepository', 'IDatasetRowsRepository'],
    },
    {
      provide: ReuploadDatasetUseCase,
      useFactory: (datasetRepo, rowsRepo, csvParser) => {
        return new ReuploadDatasetUseCase(datasetRepo, rowsRepo, csvParser);
      },
      inject: ['IDatasetRepository', 'IDatasetRowsRepository', CsvParserAdapter],
    },
    {
      provide: DeleteDatasetUseCase,
      useFactory: (datasetRepo, rowsRepo) => {
        return new DeleteDatasetUseCase(datasetRepo, rowsRepo);
      },
      inject: ['IDatasetRepository', 'IDatasetRowsRepository'],
    },
    {
      provide: DownloadDatasetUseCase,
      useFactory: (datasetRepo, rowsRepo) => {
        return new DownloadDatasetUseCase(datasetRepo, rowsRepo);
      },
      inject: ['IDatasetRepository', 'IDatasetRowsRepository'],
    },
    {
      provide: ExecuteQueryUseCase,
      useFactory: (analyticsEngine) => {
        return new ExecuteQueryUseCase(analyticsEngine);
      },
      inject: ['IAnalyticsEngine'],
    },

    // Use Cases - Charts
    {
      provide: CreateChartUseCase,
      useFactory: (chartConfigRepo) => {
        return new CreateChartUseCase(chartConfigRepo);
      },
      inject: ['IChartConfigRepository'],
    },
    {
      provide: UpdateChartUseCase,
      useFactory: (chartConfigRepo) => {
        return new UpdateChartUseCase(chartConfigRepo);
      },
      inject: ['IChartConfigRepository'],
    },
    {
      provide: DeleteChartUseCase,
      useFactory: (chartConfigRepo) => {
        return new DeleteChartUseCase(chartConfigRepo);
      },
      inject: ['IChartConfigRepository'],
    },
    {
      provide: GetChartDataUseCase,
      useFactory: (chartConfigRepo, analyticsEngine) => {
        return new GetChartDataUseCase(chartConfigRepo, analyticsEngine);
      },
      inject: ['IChartConfigRepository', 'IAnalyticsEngine'],
    },

    // Use Cases - Dashboards
    {
      provide: CreateDashboardUseCase,
      useFactory: (dashboardRepo) => {
        return new CreateDashboardUseCase(dashboardRepo);
      },
      inject: ['IDashboardRepository'],
    },
    {
      provide: UpdateDashboardUseCase,
      useFactory: (dashboardRepo) => {
        return new UpdateDashboardUseCase(dashboardRepo);
      },
      inject: ['IDashboardRepository'],
    },
    {
      provide: DeleteDashboardUseCase,
      useFactory: (dashboardRepo) => {
        return new DeleteDashboardUseCase(dashboardRepo);
      },
      inject: ['IDashboardRepository'],
    },
    {
      provide: GetDashboardUseCase,
      useFactory: (dashboardRepo, chartConfigRepo, analyticsEngine) => {
        return new GetDashboardUseCase(dashboardRepo, chartConfigRepo, analyticsEngine);
      },
      inject: ['IDashboardRepository', 'IChartConfigRepository', 'IAnalyticsEngine'],
    },
  ],
  exports: [UploadDatasetUseCase],
})
export class AnalyticsModule {}
