/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameSaveData } from '../types/game';
import { sound } from '../services/audio';
import { Play, RotateCcw, Info, Trash2, Building2, Wallet, Calendar, CheckCircle2 } from 'lucide-react';
import { PROPERTY_STAGES } from '../game/constants';

interface TitleScreenProps {
  onStartNewGame: (playerName: string, businessName: string) => void;
  onContinueGame: () => void;
  savedGame: GameSaveData | null;
  onDeleteSave: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartNewGame,
  onContinueGame,
  savedGame,
  onDeleteSave,
}) => {
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [playerName, setPlayerName] = useState('Carlos Silva');
  const [businessName, setBusinessName] = useState('Império Central');

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onStartNewGame(playerName.trim() || 'Empreendedor', businessName.trim() || 'Meu Negócio');
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 overflow-hidden">
      {/* Background Decorativo com grade sutil */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#64748b 1px, transparent 1px)', 
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px'
        }}
      />

      <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center">
        {/* Emblema / Tag de Apresentação */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-3">
          <Building2 className="w-4 h-4" />
          <span>Simulador 2D de Empreendedorismo</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          MEU IMPÉRIO
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-md mb-8 leading-relaxed">
          Comece sem recursos com apenas <span className="text-emerald-400 font-semibold font-mono-numbers">R$ 500</span> e um imóvel comercial abandonado. Reconstrua, faça bicos diários e funde seu império.
        </p>

        {/* Card de Partida Salva Encontrada */}
        {savedGame && (
          <div className="w-full mb-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Progresso Encontrado (IndexedDB)
              </span>
              <span className="text-xs text-slate-500 font-mono-numbers">
                Salvo em {new Date(savedGame.lastSavedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="font-bold text-white flex items-center gap-2">
                <span>{savedGame.businessName}</span>
                <span className="text-xs text-slate-400 font-normal">({savedGame.playerName})</span>
              </div>
              <span className="text-emerald-400 font-bold font-mono-numbers">
                R$ {savedGame.money.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Dia {savedGame.day}
              </span>
              <span>·</span>
              <span>Estágio: {PROPERTY_STAGES[savedGame.currentStageId].name}</span>
              <span>·</span>
              <span>{savedGame.completedActions.length}/8 Reformas</span>
            </div>
          </div>
        )}

        {/* Botões de Ação do Menu */}
        <div className="w-full flex flex-col gap-3">
          {savedGame && (
            <button
              onClick={() => {
                sound.playClick();
                onContinueGame();
              }}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Continuar Partida</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              setShowNewGameModal(true);
            }}
            className={`w-full py-3.5 px-6 font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              savedGame
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Novo Jogo</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setShowAboutModal(true);
              }}
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Info className="w-4 h-4 text-slate-400" />
              <span>Sobre o Projeto</span>
            </button>

            {savedGame && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza de que deseja apagar o progresso salvo?')) {
                    sound.playClick();
                    onDeleteSave();
                  }
                }}
                title="Apagar jogo salvo"
                className="py-2.5 px-3 bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 text-sm font-medium rounded-lg border border-slate-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criação de Novo Jogo */}
      {showNewGameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Fundação do Seu Império</h2>
            <p className="text-xs text-slate-400 mb-5">
              Defina seu nome e o nome da sua empresa. Você começará com R$ 500 e um imóvel em ruínas.
            </p>

            <form onSubmit={handleStartSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Empreendedor
                </label>
                <input
                  type="text"
                  required
                  maxLength={24}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-hidden focus:border-emerald-500"
                  placeholder="Ex: Carlos Silva"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Negócio / Letreiro
                </label>
                <input
                  type="text"
                  required
                  maxLength={24}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-hidden focus:border-emerald-500"
                  placeholder="Ex: Império Central"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Este nome aparecerá gravado no letreiro frontal quando o imóvel for restaurado.
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-200 font-semibold">Capital Inicial:</span> R$ 500,00
                  <span className="block text-[11px] text-slate-500">1 ação principal disponível por dia.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowNewGameModal(false);
                  }}
                  className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Iniciar Empreitada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sobre o Projeto */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-2">Sobre o MEU IMPÉRIO (MVP 0.1)</h2>
            <p className="text-xs text-slate-400 mb-4">
              Simulador 2D top-down de empreendedorismo, gestão e reconstrução progressiva.
            </p>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <h3 className="font-semibold text-emerald-400 mb-1">Mecânica Principal: 1 Ação Por Dia</h3>
                <p>
                  A cada dia o jogador escolhe entre realizar uma <strong>Reforma no Imóvel</strong> (retirar entulho, limpar, consertar elétrica, assentar piso, etc.) ou fazer um <strong>Trabalho Temporário</strong> (bico de panfletagem, servente, carga no CEASA) para capitalizar.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <h3 className="font-semibold text-emerald-400 mb-1">5 Estágios de Reconstrução Visual</h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                  <li><strong>1. Abandonado:</strong> Entulhos, lixo, paredes rachadas, piso manchado e letreiro pichado.</li>
                  <li><strong>2. Limpeza:</strong> Entulhos retirados e higienização pesada realizada.</li>
                  <li><strong>3. Estrutura Recuperada:</strong> Alvenaria restaurada e nova rede elétrica segura.</li>
                  <li><strong>4. Preparação:</strong> Piso cerâmico assentado, portas de vidro e pintura nova.</li>
                  <li><strong>5. Operacional:</strong> Fachada renovada, letreiro iluminado da sua empresa e instalações prontas para funcionar.</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <h3 className="font-semibold text-emerald-400 mb-1">Controles & Tecnologias</h3>
                <p>
                  • Câmera: Arraste com o mouse para mover o mapa. Scroll para zoom.<br/>
                  • Motor gráfico Canvas 2D sem dependências pesadas.<br/>
                  • Salvamento nativo com IndexedDB.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowAboutModal(false);
              }}
              className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
