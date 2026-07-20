/**
 * Composition root (injeção de dependência manual).
 *
 * Cada Interactor recebe suas dependências (Gateway, infra) pelo construtor.
 * Store/Part/Oven/WorkOrder/Maintenance/User usam as implementações reais
 * (*RepositoryGatewayApi), chamando o forno-api via EXPO_PUBLIC_API_URL.
 *
 * Nada em `app/` precisa mudar.
 */
import { StoreRepositoryGatewayApi } from '../repositories/StoreRepositoryGatewayApi';
import { PartRepositoryGatewayApi } from '../repositories/PartRepositoryGatewayApi';
import { OvenRepositoryGatewayApi } from '../repositories/OvenRepositoryGatewayApi';
import { WorkOrderRepositoryGatewayApi } from '../repositories/WorkOrderRepositoryGatewayApi';
import { MaintenanceRepositoryGatewayApi } from '../repositories/MaintenanceRepositoryGatewayApi';
import { UserRepositoryGatewayApi } from '../repositories/UserRepositoryGatewayApi';

import { BcryptEncrypter } from '../security/BcryptEncrypter';
import { PdfLibPdfGenerator } from '../pdf/PdfLibPdfGenerator';
import { FetchHttpClientAdapter } from '../../domain/adapters/FetchHttpClientAdapter';

import { StoreInteractor } from '../../domain/interactors/storeInteractor';
import { PartInteractor } from '../../domain/interactors/partInteractor';
import { OvenInteractor } from '../../domain/interactors/ovenInteractor';
import { WorkOrderInteractor } from '../../domain/interactors/workOrderInteractor';
import { MaintenanceInteractor } from '../../domain/interactors/maintenanceInteractor';
import { UserInteractor } from '../../domain/interactors/userInteractor';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const http = new FetchHttpClientAdapter(API_URL);

export const storeUseCase = new StoreInteractor(new StoreRepositoryGatewayApi(http));
export const partUseCase = new PartInteractor(new PartRepositoryGatewayApi(http));
export const ovenUseCase = new OvenInteractor(new OvenRepositoryGatewayApi(http));
export const maintenanceUseCase = new MaintenanceInteractor(new MaintenanceRepositoryGatewayApi(http));

export const workOrderUseCase = new WorkOrderInteractor(
  new WorkOrderRepositoryGatewayApi(http),
  ovenUseCase,
);

export const userUseCase = new UserInteractor(new UserRepositoryGatewayApi(http), new BcryptEncrypter());

export const pdfGenerator = new PdfLibPdfGenerator();
