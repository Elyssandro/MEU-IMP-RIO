/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSaveData } from '../types/game';
import { PROPERTY_STAGES } from '../game/constants';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Volume2,
  VolumeX,
  ClipboardList,
  Store,
  HelpCircle,
  Home,
} from 'lucide-react';
import { sound } from '../services/audio';

interface HUDProps {
  gameData: GameSaveData;
  onOpenDailyPlanner: () => void;
  onOpenEnterprises: () => void;
  onOpenHelp: () => void;
  onReturnToMenu: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterCamera: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameData,
  onOpenDailyPlanner,
  onOpenEnterprises,
  onOpenHelp,
  onReturnToMenu,
  onZoomIn,
  onZoomOut,
  onCenterCamera,
  soundEnabled,
  onToggleSound,
}) => {
  const currentStage = PROPERTY_STAGES[gameData.currentStageId];
  const progressPercent = Math.round((gameData.completedActions.length / 8) * 100);

  return (
    <>
      {/* Top Bar seguindo o Top Bar Contract de 3 Zonas */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        {/* Zona 1: Wordmark da marca */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onReturnToMenu();
            }}
            title="Menu Principal"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </button>
          <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
            MEU IMPÉRIO
          </span>
        </div>

        {/* Zona 2: Métricas e Links de Status em linha única */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          {/* Saldo Financeiro em Destaque */}
          <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="text-slate-400">Saldo:</span>
            <span className="font-bold text-emerald-400 font-mono-numbers text-sm">
              R$ {gameData.money.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <span className="text-slate-700" aria-hidden="true">·</span>

          {/* Calendário */}
          <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="text-slate-400">Calendário:</span>
            <span className="font-semibold text-slate-200">
              Dia {gameData.day} (Mês {gameData.month})
            </span>
          </div>

          <span className="text-slate-700" aria-hidden="true">·</span>

          {/* Estágio do Imóvel */}
          <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="text-slate-400">Imóvel:</span>
            <span className="font-semibold text-sky-300">
              {currentStage.id}. {currentStage.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono-numbers">
              ({progressPercent}%)
            </span>
          </div>

          <span className="text-slate-700" aria-hidden="true">·</span>

          {/* Link para Futuros Empreendimentos */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenEnterprises();
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Futuros Negócios</span>
          </button>
        </nav>

        {/* Zona 3: Ação Primária */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile display de saldo se tela for estreita */}
          <div className="md:hidden text-right pr-2">
            <span className="block text-[10px] text-slate-400 leading-none">Saldo</span>
            <span className="font-bold text-emerald-400 font-mono-numbers text-xs">
              R$ {gameData.money.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenDailyPlanner();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-950/40 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Planejar o Dia</span>
          </button>
        </div>
      </header>

      {/* Controles Flutuantes da Câmera & Sistema */}
      <aside className="absolute right-4 bottom-6 z-20 flex flex-col gap-2">
        <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => {
              sound.playClick();
              onZoomIn();
            }}
            title="Aproximar Câmera (+)"
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onZoomOut();
            }}
            title="Afastar Câmera (-)"
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border-t border-slate-800 cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onCenterCamera();
            }}
            title="Centralizar no Meu Imóvel"
            className="p-2.5 text-sky-400 hover:text-sky-300 hover:bg-slate-800 transition-colors border-t border-slate-800 cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            title={soundEnabled ? 'Desativar Som' : 'Ativar Som'}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-1 flex items-center justify-center cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenHelp();
            }}
            title="Ajuda e Instruções"
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-l border-slate-800 flex-1 flex items-center justify-center cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Dica de Navegação no rodapé */}
      <div className="absolute left-6 bottom-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/70 backdrop-blur-xs px-3 py-1.5 rounded-md border border-slate-800">
        <span>Arraste o mapa para mover a câmera</span>
        <span>·</span>
        <span>Scroll para zoom</span>
        <span>·</span>
        <span>Clique no imóvel para abrir o planejamento</span>
      </div>
    </>
  );
};
