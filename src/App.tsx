/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GameSaveData,
  PropertyStageId,
  RestorationAction,
  TemporaryJob,
  DayHistoryEntry,
  PropertyStageInfo,
} from './types/game';
import {
  INITIAL_MONEY,
  PROPERTY_STAGES,
  RESTORATION_ACTIONS,
} from './game/constants';
import { CityRenderer } from './game/renderer';
import { saveGame, loadGame, deleteSave } from './services/db';
import { sound } from './services/audio';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { DailyPlannerModal } from './components/DailyPlannerModal';
import { DaySummaryModal } from './components/DaySummaryModal';
import { FutureEnterprisesModal } from './components/FutureEnterprisesModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const [gameState, setGameState] = useState<'TITLE_MENU' | 'PLAYING'>('TITLE_MENU');
  const [savedGame, setSavedGame] = useState<GameSaveData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Estado do Jogo Ativo
  const [gameData, setGameData] = useState<GameSaveData>({
    version: '0.1.0',
    playerName: 'Carlos Silva',
    businessName: 'Império Central',
    money: INITIAL_MONEY,
    day: 1,
    month: 1,
    year: 2026,
    currentStageId: 1,
    completedActions: [],
    history: [],
    lastSavedAt: new Date().toISOString(),
    stats: {
      totalEarnedFromJobs: 0,
      totalSpentOnRenovation: 0,
      daysWorked: 0,
      renovationDays: 0,
    },
  });

  // Modais
  const [showDailyPlanner, setShowDailyPlanner] = useState(false);
  const [showFutureEnterprises, setShowFutureEnterprises] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [daySummary, setDaySummary] = useState<DayHistoryEntry | null>(null);
  const [stageUpgradeNotification, setStageUpgradeNotification] = useState<PropertyStageInfo | undefined>(undefined);

  // Referências do Canvas e Engine Gráfica
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CityRenderer | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const dragDistanceRef = useRef(0);

  // Carregar save inicial do IndexedDB na inicialização
  useEffect(() => {
    loadGame()
      .then((data) => {
        if (data) {
          setSavedGame(data);
        }
      })
      .catch((err) => {
        console.warn('Erro ao carregar save inicial:', err);
      });
  }, []);

  // Inicializar o motor gráfico Canvas 2D
  useEffect(() => {
    if (gameState !== 'PLAYING' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new CityRenderer(canvas);
    rendererRef.current = renderer;

    // Sincronizar dados do jogo com o renderer
    renderer.completedActions = gameData.completedActions;
    renderer.currentStage = gameData.currentStageId;
    renderer.businessName = gameData.businessName;
    renderer.day = gameData.day;
    renderer.onPropertyClick = () => {
      sound.playClick();
      setShowDailyPlanner(true);
    };

    renderer.start();

    // Redimensionar responsivamente
    const handleResize = () => {
      if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      renderer.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState]);

  // Manter o renderer atualizado sempre que o estado do jogo mudar
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.completedActions = gameData.completedActions;
      rendererRef.current.currentStage = gameData.currentStageId;
      rendererRef.current.businessName = gameData.businessName;
      rendererRef.current.day = gameData.day;
    }
  }, [gameData]);

  // Controles de mouse / toque para o Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !rendererRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    dragDistanceRef.current += Math.hypot(dx, dy);
    rendererRef.current.pan(dx, dy);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current && dragDistanceRef.current < 6 && rendererRef.current) {
      // Foi um clique simples, verificar interação
      rendererRef.current.handleClick(e.clientX, e.clientY);
    }
    isDraggingRef.current = false;
  };

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!rendererRef.current) return;
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    rendererRef.current.setZoom(delta);
  }, []);

  // Atalhos de teclado (WASD / Setas para câmera)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING' || !rendererRef.current) return;
      const speed = 25;
      if (e.key === 'w' || e.key === 'ArrowUp') rendererRef.current.pan(0, speed);
      if (e.key === 's' || e.key === 'ArrowDown') rendererRef.current.pan(0, -speed);
      if (e.key === 'a' || e.key === 'ArrowLeft') rendererRef.current.pan(speed, 0);
      if (e.key === 'd' || e.key === 'ArrowRight') rendererRef.current.pan(-speed, 0);
      if (e.key === '+' || e.key === '=') rendererRef.current.setZoom(0.15);
      if (e.key === '-' || e.key === '_') rendererRef.current.setZoom(-0.15);
      if (e.key === 'c' || e.key === 'C') rendererRef.current.centerOnProperty();
      if (e.key === 'Escape') {
        setShowDailyPlanner(false);
        setShowFutureEnterprises(false);
        setShowHelp(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Iniciar Novo Jogo
  const handleStartNewGame = (playerName: string, businessName: string) => {
    const freshGame: GameSaveData = {
      version: '0.1.0',
      playerName,
      businessName,
      money: INITIAL_MONEY,
      day: 1,
      month: 1,
      year: 2026,
      currentStageId: 1,
      completedActions: [],
      history: [],
      lastSavedAt: new Date().toISOString(),
      stats: {
        totalEarnedFromJobs: 0,
        totalSpentOnRenovation: 0,
        daysWorked: 0,
        renovationDays: 0,
      },
    };

    setGameData(freshGame);
    saveGame(freshGame).then(() => setSavedGame(freshGame));
    setGameState('PLAYING');
    sound.playStageUpgrade();
  };

  // Continuar Jogo Salvo
  const handleContinueGame = () => {
    if (savedGame) {
      setGameData(savedGame);
      setGameState('PLAYING');
      sound.playClick();
    }
  };

  // Apagar Save
  const handleDeleteSave = async () => {
    await deleteSave();
    setSavedGame(null);
  };

  // Avaliação do estágio do imóvel conforme ações concluídas
  const calculateStage = (completed: string[]): PropertyStageId => {
    if (completed.includes('restaurar_fachada')) return 5;
    if (
      completed.includes('pintar_imovel') ||
      completed.includes('trocar_portas_janelas') ||
      completed.includes('restaurar_piso')
    ) {
      return 4;
    }
    if (completed.includes('consertar_eletricidade') || completed.includes('reparar_paredes')) {
      return 3;
    }
    if (completed.includes('fazer_limpeza') || completed.includes('retirar_entulho')) {
      return 2;
    }
    return 1;
  };

  // Executar Ação de Reforma (Consome 1 Dia)
  const handleExecuteRestoration = (action: RestorationAction) => {
    if (gameData.money < action.cost) return;

    const newCompleted = [...gameData.completedActions, action.id];
    const prevStage = gameData.currentStageId;
    const newStage = calculateStage(newCompleted);
    const newMoney = Number((gameData.money - action.cost).toFixed(2));

    let upgradeInfo: PropertyStageInfo | undefined = undefined;
    if (newStage > prevStage) {
      upgradeInfo = PROPERTY_STAGES[newStage];
      sound.playStageUpgrade();
    } else {
      if (action.category === 'Higienização' || action.category === 'Descarte') {
        sound.playClean();
      } else {
        sound.playHammer();
      }
    }

    const summary: DayHistoryEntry = {
      day: gameData.day,
      actionType: 'reforma',
      title: `Reforma Realizada: ${action.name}`,
      description: `${action.description} Consequência visual: ${action.visualEffectDescription}`,
      financialChange: -action.cost,
      resultingBalance: newMoney,
      stageReached: upgradeInfo,
    };

    const updatedData: GameSaveData = {
      ...gameData,
      money: newMoney,
      completedActions: newCompleted,
      currentStageId: newStage,
      history: [summary, ...gameData.history],
      stats: {
        ...gameData.stats,
        totalSpentOnRenovation: Number((gameData.stats.totalSpentOnRenovation + action.cost).toFixed(2)),
        renovationDays: gameData.stats.renovationDays + 1,
      },
    };

    setGameData(updatedData);
    saveGame(updatedData).then(() => setSavedGame(updatedData));

    setShowDailyPlanner(false);
    setStageUpgradeNotification(upgradeInfo);
    setDaySummary(summary);
  };

  // Executar Trabalho Temporário (Consome 1 Dia)
  const handleExecuteJob = (job: TemporaryJob) => {
    sound.playCoin();

    // Cálculo do pagamento: diária base + chance de gorjeta/bônus honesto
    let earned = job.basePay;
    const hasTip = Math.random() < job.tipChance;
    let tipAmount = 0;
    if (hasTip) {
      tipAmount = Math.floor(Math.random() * job.maxTip) + 5;
      earned += tipAmount;
    }
    earned = Number(earned.toFixed(2));

    const newMoney = Number((gameData.money + earned).toFixed(2));

    const narrative = hasTip
      ? `${job.narrativeOutcome} Você ainda recebeu uma gorjeta bônus de R$ ${tipAmount.toFixed(2)} pelo ótimo desempenho!`
      : job.narrativeOutcome;

    const summary: DayHistoryEntry = {
      day: gameData.day,
      actionType: 'trabalho',
      title: `Diária Recebida: ${job.title}`,
      description: `${job.description} ${narrative}`,
      financialChange: earned,
      resultingBalance: newMoney,
    };

    const updatedData: GameSaveData = {
      ...gameData,
      money: newMoney,
      history: [summary, ...gameData.history],
      stats: {
        ...gameData.stats,
        totalEarnedFromJobs: Number((gameData.stats.totalEarnedFromJobs + earned).toFixed(2)),
        daysWorked: gameData.stats.daysWorked + 1,
      },
    };

    setGameData(updatedData);
    saveGame(updatedData).then(() => setSavedGame(updatedData));

    setShowDailyPlanner(false);
    setStageUpgradeNotification(undefined);
    setDaySummary(summary);
  };

  // Avançar para o Próximo Dia
  const handleAdvanceDay = () => {
    sound.playDayPassed();
    setDaySummary(null);
    setStageUpgradeNotification(undefined);

    const nextDay = gameData.day + 1;
    const nextMonth = Math.floor((nextDay - 1) / 30) + 1;

    const updated: GameSaveData = {
      ...gameData,
      day: nextDay,
      month: nextMonth,
      lastSavedAt: new Date().toISOString(),
    };

    setGameData(updated);
    saveGame(updated).then(() => setSavedGame(updated));

    if (rendererRef.current) {
      rendererRef.current.centerOnProperty();
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {gameState === 'TITLE_MENU' ? (
        <TitleScreen
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          savedGame={savedGame}
          onDeleteSave={handleDeleteSave}
        />
      ) : (
        <div className="relative w-full h-full">
          {/* HUD Superior e Controles */}
          <HUD
            gameData={gameData}
            onOpenDailyPlanner={() => setShowDailyPlanner(true)}
            onOpenEnterprises={() => setShowFutureEnterprises(true)}
            onOpenHelp={() => setShowHelp(true)}
            onReturnToMenu={() => {
              saveGame(gameData);
              setGameState('TITLE_MENU');
            }}
            onZoomIn={() => rendererRef.current?.setZoom(0.2)}
            onZoomOut={() => rendererRef.current?.setZoom(-0.2)}
            onCenterCamera={() => rendererRef.current?.centerOnProperty()}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />

          {/* Canvas 2D da Cidade e Imóvel */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className="w-full h-full block cursor-grab active:cursor-grabbing"
          />

          {/* Modais do Jogo */}
          {showDailyPlanner && (
            <DailyPlannerModal
              gameData={gameData}
              onClose={() => setShowDailyPlanner(false)}
              onExecuteRestoration={handleExecuteRestoration}
              onExecuteJob={handleExecuteJob}
            />
          )}

          {daySummary && (
            <DaySummaryModal
              summary={daySummary}
              newStageNotification={stageUpgradeNotification}
              onAdvanceDay={handleAdvanceDay}
            />
          )}

          {showFutureEnterprises && (
            <FutureEnterprisesModal
              onClose={() => setShowFutureEnterprises(false)}
              currentMoney={gameData.money}
              currentStageId={gameData.currentStageId}
            />
          )}

          {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </div>
      )}
    </div>
  );
}
