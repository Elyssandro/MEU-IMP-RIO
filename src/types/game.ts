/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PropertyStageId = 1 | 2 | 3 | 4 | 5;

export interface PropertyStageInfo {
  id: PropertyStageId;
  name: string;
  tagline: string;
  description: string;
  badgeColor: string;
}

export type RestorationActionId =
  | 'retirar_entulho'
  | 'fazer_limpeza'
  | 'reparar_paredes'
  | 'consertar_eletricidade'
  | 'restaurar_piso'
  | 'trocar_portas_janelas'
  | 'pintar_imovel'
  | 'restaurar_fachada';

export interface RestorationAction {
  id: RestorationActionId;
  name: string;
  category: 'Descarte' | 'Higienização' | 'Estrutura' | 'Instalações' | 'Acabamento' | 'Identidade';
  description: string;
  cost: number;
  prerequisites: RestorationActionId[];
  targetStage: PropertyStageId;
  visualEffectDescription: string;
  progressContribution: number; // Porcentagem que adiciona
}

export interface TemporaryJob {
  id: string;
  title: string;
  employer: string;
  category: string;
  description: string;
  basePay: number;
  tipChance: number;
  maxTip: number;
  riskPenaltyChance?: number;
  narrativeOutcome: string;
}

export interface DayHistoryEntry {
  day: number;
  actionType: 'reforma' | 'trabalho' | 'descanso';
  title: string;
  description: string;
  financialChange: number;
  resultingBalance: number;
  stageReached?: PropertyStageInfo;
}

export interface GameSaveData {
  version: string;
  playerName: string;
  businessName: string;
  money: number;
  day: number;
  month: number;
  year: number;
  currentStageId: PropertyStageId;
  completedActions: RestorationActionId[];
  history: DayHistoryEntry[];
  lastSavedAt: string;
  stats: {
    totalEarnedFromJobs: number;
    totalSpentOnRenovation: number;
    daysWorked: number;
    renovationDays: number;
  };
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface FutureEnterprise {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedInvestment: number;
  minStageRequired: PropertyStageId;
  revenuePotential: 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
  complexity: 'Iniciante' | 'Intermediário' | 'Avançado';
  keyEquipment: string[];
}
