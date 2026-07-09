/**
 * Composition root (injeção de dependência manual).
 *
 * Cada Interactor recebe suas dependências (Gateway, infra) pelo construtor.
 * Store/Part/Oven/WorkOrder/Maintenance ainda apontam para *GatewayImpl em
 * memória (infra/repositories); User já usa a API real (UserRepositoryGatewayApi)
 * via EXPO_PUBLIC_API_URL. Quando o back-end das demais entidades existir:
 *
 *   1. Crie, por ex., `infra/repositories/StoreRepositoryGatewayApi.ts`
 *      implementando `StoreRepositoryGateway`, usando `FetchHttpClientAdapter`
 *      ou `AxiosHttpClientAdapter` (domain/adapters) por baixo.
 *   2. Troque a linha correspondente abaixo.
 *
 * Nada em `app/` precisa mudar.
 */
import { StoreRepositoryGatewayImpl } from '../repositories/StoreRepositoryGatewayImpl';
import { PartRepositoryGatewayImpl } from '../repositories/PartRepositoryGatewayImpl';
import { OvenRepositoryGatewayImpl } from '../repositories/OvenRepositoryGatewayImpl';
import { WorkOrderRepositoryGatewayImpl } from '../repositories/WorkOrderRepositoryGatewayImpl';
import { MaintenanceRepositoryGatewayImpl } from '../repositories/MaintenanceRepositoryGatewayImpl';
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

export const storeUseCase = new StoreInteractor(new StoreRepositoryGatewayImpl());
export const partUseCase = new PartInteractor(new PartRepositoryGatewayImpl());
export const ovenUseCase = new OvenInteractor(new OvenRepositoryGatewayImpl());
export const maintenanceUseCase = new MaintenanceInteractor(new MaintenanceRepositoryGatewayImpl());

export const workOrderUseCase = new WorkOrderInteractor(
  new WorkOrderRepositoryGatewayImpl(),
  ovenUseCase,
);

export const userUseCase = new UserInteractor(
  new UserRepositoryGatewayApi(new FetchHttpClientAdapter(API_URL)),
  new BcryptEncrypter(),
);

export const pdfGenerator = new PdfLibPdfGenerator();
