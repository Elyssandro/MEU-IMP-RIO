/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DayHistoryEntry, PropertyStageInfo } from '../types/game';
import { sound } from '../services/audio';
import {
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Award,
  Wallet,
} from 'lucide-react';

interface DaySummaryModalProps {
  summary: DayHistoryEntry;
  newStageNotification?: PropertyStageInfo;
  onAdvanceDay: () => void;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
  summary,
  newStageNotification,
  onAdvanceDay,
}) => {
  const isPositive = summary.financialChange >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6">
        {/* Topo / Selo do Dia */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-full border border-slate-700 mb-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fechamento do Dia {summary.day}</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {summary.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            {summary.description}
          </p>
        </div>

        {/* Notificação Especial de Evolução de Estágio (se houver) */}
        {newStageNotification && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Novo Estágio do Imóvel Desbloqueado!
              </span>
              <span className="text-sm font-bold text-white">
                Estágio {newStageNotification.id}: {newStageNotification.name}
              </span>
              <p className="text-xs text-slate-300 mt-0.5">
                {newStageNotification.tagline}
              </p>
            </div>
          </div>
        )}

        {/* Extrato Financeiro do Dia */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Saldo Anterior</span>
            <span className="font-mono-numbers text-slate-300">
              R$ {(summary.resultingBalance - summary.financialChange).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              {isPositive ? 'Rendimento do Trabalho' : 'Investimento na Reforma'}
            </span>

            <span
              className={`font-mono-numbers font-bold text-sm ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}
              R$ {summary.financialChange.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Novo Saldo Disponível
            </span>
            <span className="font-mono-numbers font-extrabold text-base text-emerald-400">
              R$ {summary.resultingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Botão de Avanço do Dia */}
        <button
          onClick={() => {
            sound.playClick();
            onAdvanceDay();
          }}
          className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Iniciar Dia {summary.day + 1}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
