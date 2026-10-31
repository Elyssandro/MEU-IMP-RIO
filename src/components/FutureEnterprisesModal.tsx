/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FUTURE_ENTERPRISES } from '../game/constants';
import { sound } from '../services/audio';
import { Store, X, Check, Lock, DollarSign, Layers } from 'lucide-react';

interface FutureEnterprisesModalProps {
  onClose: () => void;
  currentMoney: number;
  currentStageId: number;
}

export const FutureEnterprisesModal: React.FC<FutureEnterprisesModalProps> = ({
  onClose,
  currentMoney,
  currentStageId,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Store className="w-4 h-4" />
              <span>ARQUITETURA DE EMPREENDIMENTOS</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Catálogo de Futuros Negócios
            </h2>
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

        {/* Intro */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 text-xs text-slate-300">
          Após completar a restauração do imóvel (Estágio 5: Operacional) e acumular capital com bicos, você poderá abrir seu negócio comercial e transformá-lo em uma grande fonte de receita.
        </div>

        {/* Lista de Empresas */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {FUTURE_ENTERPRISES.map((ent) => {
            const hasCapital = currentMoney >= ent.estimatedInvestment;
            const hasStage = currentStageId >= ent.minStageRequired;

            return (
              <div
                key={ent.id}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wide">
                      {ent.category}
                    </span>
                    <span className="text-xs font-mono-numbers font-bold text-emerald-400">
                      Investimento: R$ {ent.estimatedInvestment.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5">{ent.name}</h3>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {ent.description}
                  </p>

                  <div className="space-y-1 mb-3 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                    <div className="flex items-center justify-between">
                      <span>Potencial de Lucro:</span>
                      <span className="text-emerald-400 font-semibold">{ent.revenuePotential}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Complexidade:</span>
                      <span className="text-amber-400 font-semibold">{ent.complexity}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300 block mb-1">Equipamentos Chave:</span>
                    <div className="flex flex-wrap gap-1">
                      {ent.keyEquipment.map((eq, i) => (
                        <span key={i} className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-800">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    Exige Estágio 5
                  </span>

                  <span className={`font-semibold ${hasStage && hasCapital ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {hasStage ? (hasCapital ? 'Pronto para Fundar' : 'Capital Insuficiente') : 'Aguardando Reforma'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
