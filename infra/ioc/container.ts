/**
 * Composition root (injeção de dependência manual).
 *
 * Cada Interactor recebe suas dependências (Gateway, infra) pelo construtor.
 * Hoje todos os *RepositoryGateway apontam para *GatewayImpl em memória
 * (infra/repositories). Quando o back-end existir:
 *
 *   1. Crie, por ex., `infra/repositories/StoreRepositoryGatewayApi.ts`
 *      implementando `StoreRepositoryGateway`, usando `FetchHttpClientAdapter`
 *      ou `AxiosHttpClientAdapter` (domain/adapters) por baixo.
 *   2. Troque a linha correspondente abaixo.
 *
 * Nada em `app/` precisa mudar.
 */
import { StoreRepositoryGatewayImpl } from "../repositories/StoreRepositoryGatewayImpl";
import { PartRepositoryGatewayImpl } from "../repositories/PartRepositoryGatewayImpl";
import { OvenRepositoryGatewayImpl } from "../repositories/OvenRepositoryGatewayImpl";
import { WorkOrderRepositoryGatewayImpl } from "../repositories/WorkOrderRepositoryGatewayImpl";
import { MaintenanceRepositoryGatewayImpl } from "../repositories/MaintenanceRepositoryGatewayImpl";
import { UserRepositoryGatewayImpl } from "../repositories/UserRepositoryGatewayImpl";

import { BcryptEncrypter } from "../security/BcryptEncrypter";
import { SimpleTokenGenerator } from "../security/SimpleTokenGenerator";
import { PdfLibPdfGenerator } from "../pdf/PdfLibPdfGenerator";

import { StoreInteractor } from "../../domain/interactors/storeInteractor";
import { PartInteractor } from "../../domain/interactors/partInteractor";
import { OvenInteractor } from "../../domain/interactors/ovenInteractor";
import { WorkOrderInteractor } from "../../domain/interactors/workOrderInteractor";
import { MaintenanceInteractor } from "../../domain/interactors/maintenanceInteractor";
import { UserInteractor } from "../../domain/interactors/userInteractor";

export const storeUseCase = new StoreInteractor(new StoreRepositoryGatewayImpl());
export const partUseCase = new PartInteractor(new PartRepositoryGatewayImpl());
export const ovenUseCase = new OvenInteractor(new OvenRepositoryGatewayImpl());
export const maintenanceUseCase = new MaintenanceInteractor(new MaintenanceRepositoryGatewayImpl());

export const workOrderUseCase = new WorkOrderInteractor(new WorkOrderRepositoryGatewayImpl(), ovenUseCase);

export const userUseCase = new UserInteractor(
  new UserRepositoryGatewayImpl(),
  new BcryptEncrypter(),
  new SimpleTokenGenerator()
);

export const pdfGenerator = new PdfLibPdfGenerator();
