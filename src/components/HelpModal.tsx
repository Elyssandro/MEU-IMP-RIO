/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sound } from '../services/audio';
import { X, Navigation, MousePointer, Calendar, Coins } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">Instruções de Jogo</h2>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <MousePointer className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Navegação e Câmera</strong>
              Arraste o mapa com o botão esquerdo do mouse para navegar pela cidade. Use a roda do mouse (scroll) para aproximar ou afastar o zoom.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <Calendar className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">1 Ação Principal por Dia</strong>
              Cada dia permite realizar exatamente uma ação: uma reforma no imóvel ou um trabalho temporário para juntar dinheiro.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <Coins className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Gestão Financeira</strong>
              Você começou com R$ 500. Não é possível realizar reformas sem saldo suficiente nem sem cumprir a ordem natural de pré-requisitos da construção civil.
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs cursor-pointer"
        >
          Entendido, Voltar ao Jogo
        </button>
      </div>
    </div>
  );
};
