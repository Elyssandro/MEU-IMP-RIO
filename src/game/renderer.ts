/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RestorationActionId, PropertyStageId } from '../types/game';

interface Car {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  width: number;
  length: number;
  direction: 'H' | 'V';
}

interface Pedestrian {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  hatColor: string;
}

export class CityRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;

  // Câmera
  public cameraX: number = 0;
  public cameraY: number = 0;
  public zoom: number = 1.0;
  private targetZoom: number = 1.0;

  // Estado do jogo
  public completedActions: RestorationActionId[] = [];
  public currentStage: PropertyStageId = 1;
  public businessName: string = 'MEU IMPÉRIO';
  public day: number = 1;

  // Entidades urbanas animadas
  private cars: Car[] = [];
  private pedestrians: Pedestrian[] = [];
  private lastTime: number = 0;
  private sparkTimer: number = 0;

  // Callback de clique no imóvel
  public onPropertyClick?: () => void;

  // Posição e dimensões do imóvel do jogador no espaço do mundo (World Coordinates)
  public readonly propertyWorld = {
    x: 420,
    y: 220,
    width: 360,
    height: 260,
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Não foi possível obter contexto 2D do Canvas');
    }
    this.ctx = context;

    this.initWorldEntities();
    this.centerOnProperty();
  }

  public centerOnProperty() {
    this.cameraX = this.propertyWorld.x + this.propertyWorld.width / 2;
    this.cameraY = this.propertyWorld.y + this.propertyWorld.height / 2;
    this.targetZoom = 1.15;
    this.zoom = 1.15;
  }

  public setZoom(delta: number) {
    this.targetZoom = Math.min(2.2, Math.max(0.55, this.targetZoom + delta));
  }

  public resetZoom() {
    this.targetZoom = 1.0;
  }

  public pan(dx: number, dy: number) {
    this.cameraX -= dx / this.zoom;
    this.cameraY -= dy / this.zoom;
  }

  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const worldX = this.cameraX + (screenX - rect.left - cx) / this.zoom;
    const worldY = this.cameraY + (screenY - rect.top - cy) / this.zoom;
    return { x: worldX, y: worldY };
  }

  public handleClick(screenX: number, screenY: number) {
    const world = this.screenToWorld(screenX, screenY);
    const p = this.propertyWorld;
    if (
      world.x >= p.x - 20 &&
      world.x <= p.x + p.width + 20 &&
      world.y >= p.y - 40 &&
      world.y <= p.y + p.height + 20
    ) {
      if (this.onPropertyClick) {
        this.onPropertyClick();
      }
    }
  }

  private initWorldEntities() {
    // Carros transitando pelas avenidas
    this.cars = [
      { x: 50, y: 155, vx: 2.2, vy: 0, color: '#3b82f6', width: 22, length: 42, direction: 'H' },
      { x: 600, y: 155, vx: 2.5, vy: 0, color: '#ef4444', width: 22, length: 44, direction: 'H' },
      { x: 900, y: 125, vx: -2.8, vy: 0, color: '#eab308', width: 22, length: 46, direction: 'H' },
      { x: 300, y: 125, vx: -2.0, vy: 0, color: '#10b981', width: 22, length: 40, direction: 'H' },
      // Avenida Vertical
      { x: 845, y: 50, vx: 0, vy: 2.4, color: '#f97316', width: 22, length: 42, direction: 'V' },
      { x: 875, y: 650, vx: 0, vy: -2.6, color: '#8b5cf6', width: 22, length: 44, direction: 'V' },
    ];

    // Pedestres caminhando pelas calçadas
    this.pedestrians = [
      { x: 380, y: 185, vx: 0.6, vy: 0, color: '#60a5fa', hatColor: '#1e3a8a' },
      { x: 620, y: 185, vx: -0.5, vy: 0, color: '#f43f5e', hatColor: '#881337' },
      { x: 810, y: 280, vx: 0, vy: 0.6, color: '#34d399', hatColor: '#064e3b' },
      { x: 810, y: 460, vx: 0, vy: -0.5, color: '#fbbf24', hatColor: '#78350f' },
      { x: 260, y: 495, vx: 0.7, vy: 0, color: '#a78bfa', hatColor: '#4c1d95' },
    ];
  }

  public start() {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      const delta = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      this.update(delta);
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private update(delta: number) {
    // Zoom suave
    this.zoom += (this.targetZoom - this.zoom) * Math.min(1, delta * 10);
    this.sparkTimer += delta;

    // Atualizar carros
    for (const car of this.cars) {
      if (car.direction === 'H') {
        car.x += car.vx;
        if (car.vx > 0 && car.x > 1500) car.x = -100;
        if (car.vx < 0 && car.x < -100) car.x = 1500;
      } else {
        car.y += car.vy;
        if (car.vy > 0 && car.y > 1000) car.y = -100;
        if (car.vy < 0 && car.y < -100) car.y = 1000;
      }
    }

    // Atualizar pedestres
    for (const ped of this.pedestrians) {
      ped.x += ped.vx;
      ped.y += ped.vy;
      if (ped.vx !== 0) {
        if (ped.x > 800) ped.vx = -Math.abs(ped.vx);
        if (ped.x < 300) ped.vx = Math.abs(ped.vx);
      }
      if (ped.vy !== 0) {
        if (ped.y > 520) ped.vy = -Math.abs(ped.vy);
        if (ped.y < 220) ped.vy = Math.abs(ped.vy);
      }
    }
  }

  private render() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Redimensionar resolução lógica se necessário
    if (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight) {
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
    }

    ctx.save();
    // Limpar fundo urbano neutro
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Transformação da Câmera
    ctx.translate(width / 2, height / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.cameraX, -this.cameraY);

    // 1. Terreno e Lotes Urbanos
    this.renderGroundAndDistricts(ctx);

    // 2. Ruas, Faixas e Asfalto
    this.renderStreets(ctx);

    // 3. Edifícios Vizinhos (Contexto Urbano)
    this.renderNeighboringBuildings(ctx);

    // 4. Carros e Pedestres
    this.renderVehiclesAndPedestrians(ctx);

    // 5. Imóvel do Jogador (Destaque Principal com Reconstrução Progressiva)
    this.renderPlayerProperty(ctx);

    // 6. Mobiliário Urbano e Detalhes (Árvores, Postes de Luz)
    this.renderUrbanProps(ctx);

    ctx.restore();
  }

  private renderGroundAndDistricts(ctx: CanvasRenderingContext2D) {
    // Área gramada de praça pública ao norte
    ctx.fillStyle = '#1e3a2f';
    ctx.fillRect(50, -200, 320, 280);

    // Lotes comerciais cinza claro/ardósia
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-200, -200, 1600, 1200);

    // Calçadas urbanas amplas
    ctx.fillStyle = '#334155';
    // Calçada do quarteirão do jogador
    ctx.fillRect(380, 180, 440, 340);
    ctx.fillStyle = '#475569';
    ctx.strokeRect(380, 180, 440, 340);

    // Calçada quarteirão oeste
    ctx.fillStyle = '#334155';
    ctx.fillRect(50, 180, 280, 340);

    // Calçada quarteirão sul
    ctx.fillRect(380, 560, 440, 300);
  }

  private renderStreets(ctx: CanvasRenderingContext2D) {
    // Avenida Horizontal (Rua do Comércio)
    ctx.fillStyle = '#181e29';
    ctx.fillRect(-200, 100, 1600, 80);

    // Avenida Vertical (Avenida Progresso)
    ctx.fillRect(820, -200, 80, 1200);

    // Rua Secundária Sul
    ctx.fillRect(-200, 520, 1600, 40);

    // Linhas divisórias das pistas amarelas tracejadas
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.setLineDash([16, 16]);

    // Avenida Horizontal
    ctx.beginPath();
    ctx.moveTo(-200, 140);
    ctx.lineTo(1400, 140);
    ctx.stroke();

    // Avenida Vertical
    ctx.beginPath();
    ctx.moveTo(860, -200);
    ctx.lineTo(860, 1000);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Faixas de Pedestres
    this.drawCrosswalk(ctx, 350, 100, 28, 80, 'H');
    this.drawCrosswalk(ctx, 790, 100, 28, 80, 'H');
    this.drawCrosswalk(ctx, 820, 182, 80, 26, 'V');
  }

  private drawCrosswalk(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dir: 'H' | 'V') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    if (dir === 'H') {
      const stripes = 6;
      const stripeHeight = h / (stripes * 2);
      for (let i = 0; i < stripes; i++) {
        ctx.fillRect(x, y + i * stripeHeight * 2, w, stripeHeight);
      }
    } else {
      const stripes = 6;
      const stripeWidth = w / (stripes * 2);
      for (let i = 0; i < stripes; i++) {
        ctx.fillRect(x + i * stripeWidth * 2, y, stripeWidth, h);
      }
    }
  }

  private renderNeighboringBuildings(ctx: CanvasRenderingContext2D) {
    // Vizinho Oeste: Padaria / Mercado Tradicional
    ctx.fillStyle = '#292524';
    ctx.fillRect(60, 200, 240, 200);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(70, 210, 220, 180);
    // Toldo listrado
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(70, 390, 220, 15);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MERCADO SÃO JORGE', 110, 380);

    // Vizinho Sul: Galpão / Auto Mecânica
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(390, 580, 260, 160);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(405, 595, 230, 130);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('AUTO MECÂNICA VITOR', 440, 660);

    // Vizinho Leste (além da avenida): Edifício Comercial
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(920, 190, 220, 320);
    ctx.fillStyle = '#312e81';
    ctx.fillRect(935, 205, 190, 290);
    // Janelas de vidro do prédio
    ctx.fillStyle = '#38bdf8';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.fillRect(955 + c * 50, 230 + r * 55, 30, 35);
      }
    }
  }

  private renderVehiclesAndPedestrians(ctx: CanvasRenderingContext2D) {
    // Renderizar carros
    for (const car of this.cars) {
      ctx.save();
      ctx.translate(car.x, car.y);

      // Sombra do carro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(-car.length / 2 + 3, -car.width / 2 + 3, car.length, car.width);

      // Chassi do carro
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.roundRect(-car.length / 2, -car.width / 2, car.length, car.width, 4);
      ctx.fill();

      // Para-brisa e teto
      ctx.fillStyle = '#0f172a';
      if (car.direction === 'H') {
        const dirSign = car.vx >= 0 ? 1 : -1;
        ctx.fillRect(-car.length / 4, -car.width / 2 + 2, car.length / 2, car.width - 4);
        // Faróis
        ctx.fillStyle = '#fef08a';
        ctx.fillRect((car.length / 2 - 2) * dirSign, -car.width / 2 + 2, 2 * dirSign, 4);
        ctx.fillRect((car.length / 2 - 2) * dirSign, car.width / 2 - 6, 2 * dirSign, 4);
      } else {
        const dirSign = car.vy >= 0 ? 1 : -1;
        ctx.fillRect(-car.width / 2 + 2, -car.length / 4, car.width - 4, car.length / 2);
        // Faróis
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-car.width / 2 + 2, (car.length / 2 - 2) * dirSign, 4, 2 * dirSign);
        ctx.fillRect(car.width / 2 - 6, (car.length / 2 - 2) * dirSign, 4, 2 * dirSign);
      }
      ctx.restore();
    }

    // Renderizar pedestres
    for (const ped of this.pedestrians) {
      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(ped.x + 2, ped.y + 2, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Corpo
      ctx.fillStyle = ped.color;
      ctx.beginPath();
      ctx.arc(ped.x, ped.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Cabeça / Boné
      ctx.fillStyle = ped.hatColor;
      ctx.beginPath();
      ctx.arc(ped.x, ped.y - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * RENDERIZAÇÃO DO IMÓVEL DO JOGADOR
   * Mostra com clareza cristalina as etapas reais de reforma executadas pelo jogador!
   */
  private renderPlayerProperty(ctx: CanvasRenderingContext2D) {
    const p = this.propertyWorld;
    const actions = this.completedActions;

    const hasDebrisRemoved = actions.includes('retirar_entulho');
    const hasCleaned = actions.includes('fazer_limpeza');
    const hasRepairedWalls = actions.includes('reparar_paredes');
    const hasFixedElectric = actions.includes('consertar_eletricidade');
    const hasFlooring = actions.includes('restaurar_piso');
    const hasDoorsWindows = actions.includes('trocar_portas_janelas');
    const hasPainted = actions.includes('pintar_imovel');
    const hasFacade = actions.includes('restaurar_fachada');

    ctx.save();

    // 1. Sombra da edificação
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(p.x + 8, p.y + 8, p.width, p.height);

    // 2. Calçada frontal própria do imóvel
    if (hasFacade) {
      // Calçada renovada com piso tátil e ladrilhos novos
      ctx.fillStyle = '#64748b';
      ctx.fillRect(p.x - 10, p.y + p.height, p.width + 20, 25);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(p.x - 10, p.y + p.height, p.width + 20, 25);
    } else {
      // Calçada quebrada com mato
      ctx.fillStyle = '#334155';
      ctx.fillRect(p.x - 10, p.y + p.height, p.width + 20, 25);
      // Rachaduras na calçada
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x + 30, p.y + p.height + 2);
      ctx.lineTo(p.x + 50, p.y + p.height + 20);
      ctx.moveTo(p.x + 200, p.y + p.height + 4);
      ctx.lineTo(p.x + 225, p.y + p.height + 18);
      ctx.stroke();
    }

    // 3. PISO DO IMÓVEL (Cutaway interior visível)
    const intX = p.x + 16;
    const intY = p.y + 45;
    const intW = p.width - 32;
    const intH = p.height - 65;

    if (hasFlooring) {
      // Piso cerâmico brilhante e moderno (Gris / Porcelanato Polido)
      ctx.fillStyle = hasPainted ? '#f1f5f9' : '#e2e8f0';
      ctx.fillRect(intX, intY, intW, intH);

      // Grade de rejunte
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      const tileSize = 24;
      ctx.beginPath();
      for (let x = intX; x <= intX + intW; x += tileSize) {
        ctx.moveTo(x, intY);
        ctx.lineTo(x, intY + intH);
      }
      for (let y = intY; y <= intY + intH; y += tileSize) {
        ctx.moveTo(intX, y);
        ctx.lineTo(intX + intW, y);
      }
      ctx.stroke();

      // Reflexo especular diagonal suave no piso
      const grad = ctx.createLinearGradient(intX, intY, intX + intW, intY + intH);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      ctx.fillStyle = grad;
      ctx.fillRect(intX, intY, intW, intH);
    } else {
      // Contrapiso de concreto áspero e manchado
      ctx.fillStyle = hasCleaned ? '#52525b' : '#3f3f46';
      ctx.fillRect(intX, intY, intW, intH);

      if (!hasCleaned) {
        // Manchas de graxa, sujeira e terra
        ctx.fillStyle = 'rgba(24, 24, 27, 0.8)';
        ctx.beginPath();
        ctx.ellipse(intX + 80, intY + 60, 40, 25, 0.3, 0, Math.PI * 2);
        ctx.ellipse(intX + 220, intY + 110, 50, 30, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Poça d'água / umidade no canto
        ctx.fillStyle = 'rgba(30, 58, 138, 0.4)';
        ctx.beginPath();
        ctx.ellipse(intX + 160, intY + 140, 35, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. ENTULHOS E RESTOS DE OBRAS (se NÃO retirou entulho)
    if (!hasDebrisRemoved) {
      // Pilha 1 de entulho: tijolos vermelhos quebrados
      ctx.fillStyle = '#b91c1c';
      for (let i = 0; i < 7; i++) {
        const bx = intX + 30 + (i % 3) * 14;
        const by = intY + 80 + Math.floor(i / 3) * 12;
        ctx.fillRect(bx, by, 12, 8);
        ctx.strokeStyle = '#450a0a';
        ctx.strokeRect(bx, by, 12, 8);
      }

      // Pilha 2 de entulho: caixotes de madeira apodrecidos e vigas quebradas
      ctx.fillStyle = '#78350f';
      ctx.fillRect(intX + 230, intY + 30, 36, 28);
      ctx.fillRect(intX + 250, intY + 45, 30, 24);
      // Tábuas cruzadas
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(intX + 220, intY + 60);
      ctx.lineTo(intX + 285, intY + 25);
      ctx.stroke();

      // Pilha 3 de lixo: sacos rasgados e latas enferrujadas
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(intX + 130, intY + 40, 14, 0, Math.PI * 2);
      ctx.arc(intX + 150, intY + 45, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(intX + 140, intY + 32, 8, 12);
    }

    // 5. TEIAS DE ARANHA E SUJEIRAS NOS CANTOS (se NÃO limpou)
    if (!hasCleaned) {
      ctx.strokeStyle = 'rgba(212, 212, 216, 0.4)';
      ctx.lineWidth = 1;
      // Teia no canto superior esquerdo
      ctx.beginPath();
      ctx.moveTo(intX, intY + 25);
      ctx.lineTo(intX + 25, intY);
      ctx.moveTo(intX, intY + 40);
      ctx.lineTo(intX + 40, intY);
      ctx.stroke();

      // Teia no canto superior direito
      ctx.beginPath();
      ctx.moveTo(intX + intW, intY + 25);
      ctx.lineTo(intX + intW - 25, intY);
      ctx.moveTo(intX + intW, intY + 40);
      ctx.lineTo(intX + intW - 40, intY);
      ctx.stroke();
    }

    // 6. PAREDES EXTERNAS E ESTRUTURA
    const wallThick = 14;
    // Cor da alvenaria conforme estado de pintura e reparo
    let wallColor = '#475569';
    let wallBorder = '#1e293b';

    if (hasPainted) {
      wallColor = '#0f766e'; // Verde petróleo moderno elegante
      wallBorder = '#134e4a';
    } else if (hasRepairedWalls) {
      wallColor = '#64748b'; // Reboco limpo cinza claro
      wallBorder = '#334155';
    } else {
      wallColor = '#713f12'; // Alvenaria crua danificada com infiltração
      wallBorder = '#451a03';
    }

    // Parede Norte (Traseira)
    ctx.fillStyle = wallColor;
    ctx.fillRect(p.x, p.y + 25, p.width, wallThick);

    // Parede Oeste (Lateral Esquerda)
    ctx.fillRect(p.x, p.y + 25, wallThick, p.height - 25);

    // Parede Leste (Lateral Direita)
    ctx.fillRect(p.x + p.width - wallThick, p.y + 25, wallThick, p.height - 25);

    // Parede Sul Frontal com vão para entrada
    const doorWidth = 70;
    const doorX = p.x + (p.width - doorWidth) / 2;
    // Segmento frontal esquerdo
    ctx.fillRect(p.x, p.y + p.height - wallThick, doorX - p.x, wallThick);
    // Segmento frontal direito
    ctx.fillRect(doorX + doorWidth, p.y + p.height - wallThick, p.x + p.width - (doorX + doorWidth), wallThick);

    // Se NÃO reparou paredes, desenhar rachaduras profundas visíveis
    if (!hasRepairedWalls) {
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 2.5;
      // Rachadura na parede esquerda
      ctx.beginPath();
      ctx.moveTo(p.x + 4, p.y + 60);
      ctx.lineTo(p.x + 12, p.y + 90);
      ctx.lineTo(p.x + 6, p.y + 130);
      ctx.stroke();

      // Rachadura na parede de trás
      ctx.beginPath();
      ctx.moveTo(p.x + 100, p.y + 28);
      ctx.lineTo(p.x + 140, p.y + 36);
      ctx.lineTo(p.x + 180, p.y + 30);
      ctx.stroke();

      // Buraco com tijolos expostos na parede leste
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(p.x + p.width - 12, p.y + 110, 8, 18);
    }

    // 7. INSTALAÇÃO ELÉTRICA & ILUMINAÇÃO
    if (hasFixedElectric) {
      // Conduítes organizados e quadro elétrico
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + 22, p.y + 42);
      ctx.lineTo(p.x + p.width - 22, p.y + 42);
      ctx.lineTo(p.x + p.width - 22, p.y + 120);
      ctx.stroke();

      // Quadro de disjuntores com luz verde
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x + p.width - 26, p.y + 110, 10, 20);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(p.x + p.width - 24, p.y + 114, 6, 4);

      // Lâmpadas no teto acesas emitindo luz
      const lightPositions = [
        { x: intX + intW * 0.3, y: intY + intH * 0.4 },
        { x: intX + intW * 0.7, y: intY + intH * 0.4 },
      ];

      for (const pos of lightPositions) {
        // Luminária embutida
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Halo de iluminação aconchegante
        const radGrad = ctx.createRadialGradient(pos.x, pos.y, 4, pos.x, pos.y, 70);
        radGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        radGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.15)');
        radGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 70, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Fios soltos pendurados perigosos
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x + 60, p.y + 38);
      ctx.bezierCurveTo(p.x + 70, p.y + 70, p.x + 90, p.y + 80, p.x + 85, p.y + 95);
      ctx.stroke();

      // Pequenas faíscas elétricas intermitentes
      if (Math.sin(this.sparkTimer * 8) > 0.8) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(p.x + 85, p.y + 95, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 8. PORTAS E JANELAS / VITRINES
    if (hasDoorsWindows) {
      // Vitrine frontal transparente moderna
      ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
      ctx.fillRect(doorX - 60, p.y + p.height - wallThick + 2, 55, wallThick - 4);
      ctx.fillRect(doorX + doorWidth + 5, p.y + p.height - wallThick + 2, 55, wallThick - 4);

      // Porta de vidro duplo deslizante
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
      ctx.fillRect(doorX, p.y + p.height - wallThick + 2, doorWidth, wallThick - 4);
      // Puxador cromado
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(doorX + doorWidth / 2 - 2, p.y + p.height - wallThick + 4, 4, wallThick - 8);
    } else {
      // Janelas quebradas cobertas com tábuas em 'X'
      ctx.fillStyle = '#78350f';
      ctx.fillRect(doorX - 60, p.y + p.height - wallThick + 2, 55, wallThick - 4);
      ctx.fillRect(doorX + doorWidth + 5, p.y + p.height - wallThick + 2, 55, wallThick - 4);
      // Vão da porta sem folhas (apenas buraco escuro)
      ctx.fillStyle = '#18181b';
      ctx.fillRect(doorX, p.y + p.height - wallThick + 2, doorWidth, wallThick - 4);
    }

    // 9. MOBILIÁRIO OPERACIONAL (Se estiver operacional / Estágio 5)
    if (hasFacade && hasPainted) {
      // Balcão de atendimento em L
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(intX + 40, intY + 70, 70, 22);
      ctx.fillRect(intX + 40, intY + 92, 22, 45);

      // Computador / Terminal de Vendas
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(intX + 60, intY + 72, 14, 10);

      // Prateleiras de estoque nos fundos
      ctx.fillStyle = '#475569';
      ctx.fillRect(intX + 160, intY + 8, 110, 14);
      ctx.fillStyle = '#f59e0b';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(intX + 165 + i * 20, intY + 10, 14, 10);
      }

      // Planta decorativa moderna no vaso
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(intX + 25, intY + intH - 25, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(intX + 25, intY + intH - 25, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 10. FACHADA E LETREIRO (O grande momento da transformação!)
    const facadeHeight = 32;
    const facadeY = p.y - 5;

    if (hasFacade) {
      // Marquise moderna com borda iluminada
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p.x, facadeY, p.width, facadeHeight);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, facadeY, p.width, facadeHeight);

      // Iluminação de LED neon superior
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p.x + 10, facadeY + facadeHeight - 3, p.width - 20, 3);

      // Texto do Letreiro (Nome do Negócio)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.businessName.toUpperCase(), p.x + p.width / 2, facadeY + facadeHeight / 2);

      // Estágio Operacional - Tag sutil
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('EM FUNCIONAMENTO', p.x + p.width / 2, facadeY + facadeHeight + 9);
    } else {
      // Letreiro destruído, enferrujado e pichado
      ctx.fillStyle = '#52525b';
      ctx.fillRect(p.x + 20, facadeY + 6, p.width - 40, facadeHeight - 6);
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x + 20, facadeY + 6, p.width - 40, facadeHeight - 6);

      // Letras caídas e ferrugem
      ctx.fillStyle = '#71717a';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VENDE-SE / ALUGADO (ABANDONADO)', p.x + p.width / 2, facadeY + facadeHeight / 2 + 2);

      // Pichação avermelhada/preta desordenada
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x + 40, facadeY + 12);
      ctx.lineTo(p.x + 70, facadeY + 24);
      ctx.lineTo(p.x + 90, facadeY + 14);
      ctx.stroke();
    }

    // Indicador sutil de clique / interação no topo
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('📍 SEU IMÓVEL (CLIQUE PARA PLANEJAR O DIA)', p.x + p.width / 2, p.y - 20);

    ctx.restore();
  }

  private renderUrbanProps(ctx: CanvasRenderingContext2D) {
    // Árvores nas calçadas
    const trees = [
      { x: 330, y: 195, r: 18 },
      { x: 330, y: 480, r: 18 },
      { x: 800, y: 530, r: 16 },
      { x: 200, y: -80, r: 24 },
      { x: 280, y: -100, r: 28 },
    ];

    for (const tree of trees) {
      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(tree.x + 4, tree.y + 4, tree.r, tree.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Copa verde
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(tree.x, tree.y, tree.r, 0, Math.PI * 2);
      ctx.fill();

      // Destaque de luz na folhagem
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(tree.x - tree.r * 0.25, tree.y - tree.r * 0.25, tree.r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    // Postes de iluminação pública com cones de luz
    const lamps = [
      { x: 400, y: 160 },
      { x: 780, y: 160 },
      { x: 840, y: 240 },
    ];

    for (const lamp of lamps) {
      // Cone de luz suave
      const lampGrad = ctx.createRadialGradient(lamp.x, lamp.y, 2, lamp.x, lamp.y, 45);
      lampGrad.addColorStop(0, 'rgba(253, 224, 71, 0.25)');
      lampGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = lampGrad;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, 45, 0, Math.PI * 2);
      ctx.fill();

      // Base do poste
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
