/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GameSaveData,
  RestorationAction,
  RestorationActionId,
  TemporaryJob,
} from '../types/game';
import {
  RESTORATION_ACTIONS,
  TEMPORARY_JOBS,
  PROPERTY_STAGES,
} from '../game/constants';
import { sound } from '../services/audio';
import {
  Wrench,
  Briefcase,
  Building,
  CheckCircle2,
  Lock,
  AlertCircle,
  X,
  Coins,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface DailyPlannerModalProps {
  gameData: GameSaveData;
  onClose: () => void;
  onExecuteRestoration: (action: RestorationAction) => void;
  onExecuteJob: (job: TemporaryJob) => void;
}

export const DailyPlannerModal: React.FC<DailyPlannerModalProps> = ({
  gameData,
  onClose,
  onExecuteRestoration,
  onExecuteJob,
}) => {
  const [activeTab, setActiveTab] = useState<'reformas' | 'trabalhos' | 'diagnostico'>('reformas');

  const currentStage = PROPERTY_STAGES[gameData.currentStageId];

  // Helper para checar se ação tem pré-requisitos atendidos
  const checkPrerequisitesMet = (action: RestorationAction): { met: boolean; missing: string[] } => {
    const missing: string[] = [];
    for (const prereqId of action.prerequisites) {
      if (!gameData.completedActions.includes(prereqId)) {
        const found = RESTORATION_ACTIONS.find((a) => a.id === prereqId);
        missing.push(found ? found.name : prereqId);
      }
    }
    return { met: missing.length === 0, missing };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span>DIA {gameData.day}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-normal">Uma ação principal por dia</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Planejamento Diário
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[11px] text-slate-400">Saldo Disponível</span>
              <span className="text-base font-bold text-emerald-400 font-mono-numbers">
                R$ {gameData.money.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Abas Segmentadas */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-900 border-b border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('reformas');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'reformas'
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wrench className="w-4 h-4 text-sky-400" />
            <span>Reformas do Imóvel ({gameData.completedActions.length}/8)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('trabalhos');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'trabalhos'
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Trabalhos Temporários (Bicos)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('diagnostico');
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'diagnostico'
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building className="w-4 h-4 text-amber-400" />
            <span>Diagnóstico do Imóvel</span>
          </button>
        </div>

        {/* Conteúdo com Rolagem */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* ABA 1: REFORMAS */}
          {activeTab === 'reformas' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">Reconstrução Progressiva:</span> Cada reforma altera diretamente os elementos visuais do imóvel no Canvas.
                </div>
                <div className="text-slate-400">
                  Etapa atual: <span className="font-bold text-sky-300">{currentStage.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RESTORATION_ACTIONS.map((action) => {
                  const isCompleted = gameData.completedActions.includes(action.id);
                  const { met, missing } = checkPrerequisitesMet(action);
                  const hasMoney = gameData.money >= action.cost;
                  const canExecute = !isCompleted && met && hasMoney;

                  return (
                    <div
                      key={action.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300'
                          : canExecute
                          ? 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
                          : 'bg-slate-900/50 border-slate-800/60 opacity-75'
                      }`}
                    >
                      <div>
                        {/* Topo do card: Categoria e Custo */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
                            {action.category}
                          </span>

                          <span
                            className={`font-mono-numbers text-xs font-bold ${
                              isCompleted
                                ? 'text-emerald-400'
                                : hasMoney
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}
                          >
                            {isCompleted
                              ? 'Concluído'
                              : `R$ ${action.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                          </span>
                        </div>

                        {/* Nome da Ação */}
                        <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          <span>{action.name}</span>
                        </h3>

                        {/* Descrição */}
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                          {action.description}
                        </p>

                        {/* Impacto Visual Real */}
                        <div className="mb-3 text-[11px] text-sky-300/90 bg-sky-950/30 p-2 rounded-md border border-sky-900/40 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span><strong>Visual:</strong> {action.visualEffectDescription}</span>
                        </div>

                        {/* Pré-requisitos Pendentes (se houver) */}
                        {!met && !isCompleted && (
                          <div className="mb-3 text-[11px] text-amber-400/90 bg-amber-950/30 p-2 rounded-md border border-amber-900/40 flex items-start gap-1.5">
                            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              <strong>Requer primeiro:</strong> {missing.join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Falta de Saldo (se atender pré-requisitos mas faltar dinheiro) */}
                        {met && !hasMoney && !isCompleted && (
                          <div className="mb-3 text-[11px] text-red-400 bg-red-950/30 p-2 rounded-md border border-red-900/40 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Faltam <strong>R$ {(action.cost - gameData.money).toFixed(2)}</strong>. Faça trabalhos temporários para arrecadar.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Botão de Ação */}
                      <div className="pt-2 border-t border-slate-800">
                        {isCompleted ? (
                          <div className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1 py-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Reforma Executada</span>
                          </div>
                        ) : (
                          <button
                            disabled={!canExecute}
                            onClick={() => {
                              onExecuteRestoration(action);
                            }}
                            className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                              canExecute
                                ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer shadow-sm'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Executar Reforma Hoje</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABA 2: TRABALHOS TEMPORÁRIOS */}
          {activeTab === 'trabalhos' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-emerald-400">Fonte de Renda:</span> Trabalhe hoje para juntar capital e pagar pelas reformas estruturais do seu imóvel. Essa atividade consome o turno diário.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPORARY_JOBS.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          {job.category}
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 font-mono-numbers">
                            +R$ {job.basePay.toFixed(2)}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            + até R$ {job.maxTip.toFixed(2)} bônus
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1">{job.title}</h3>
                      <span className="block text-[11px] text-slate-400 mb-2 font-medium">
                        Contratante: {job.employer}
                      </span>

                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      <button
                        onClick={() => {
                          onExecuteJob(job);
                        }}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Coins className="w-4 h-4" />
                        <span>Trabalhar Hoje e Receber Diária</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 3: DIAGNÓSTICO DO IMÓVEL */}
          {activeTab === 'diagnostico' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Estágio Geral do Imóvel
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    Estágio {currentStage.id}: {currentStage.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    {currentStage.description}
                  </p>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono-numbers">
                    {Math.round((gameData.completedActions.length / 8) * 100)}%
                  </div>
                  <span className="text-xs text-slate-500">Prontidão para Negócios</span>
                </div>
              </div>

              {/* Linha do tempo dos 5 Estágios */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Escala dos 5 Estágios de Evolução
                </h4>

                <div className="space-y-2">
                  {([1, 2, 3, 4, 5] as const).map((stageNum) => {
                    const stage = PROPERTY_STAGES[stageNum];
                    const isReached = gameData.currentStageId >= stageNum;
                    const isCurrent = gameData.currentStageId === stageNum;

                    return (
                      <div
                        key={stageNum}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                          isCurrent
                            ? 'bg-slate-800 border-sky-500/80 text-white font-medium'
                            : isReached
                            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                            : 'bg-slate-950/40 border-slate-900 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                              isReached
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {stageNum}
                          </span>
                          <div>
                            <span className="font-bold">{stage.name}</span>
                            <span className="hidden sm:inline text-slate-400 ml-2">
                              · {stage.tagline}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold">
                          {isCurrent ? (
                            <span className="text-sky-400">Estágio Atual</span>
                          ) : isReached ? (
                            <span className="text-emerald-400">Alcançado</span>
                          ) : (
                            <span className="text-slate-600">Bloqueado</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
