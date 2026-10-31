/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PropertyStageId,
  PropertyStageInfo,
  RestorationAction,
  TemporaryJob,
  FutureEnterprise,
} from '../types/game';

export const INITIAL_MONEY = 500;

export const PROPERTY_STAGES: Record<PropertyStageId, PropertyStageInfo> = {
  1: {
    id: 1,
    name: 'Abandonado',
    tagline: 'Em ruínas e tomado por entulho',
    description:
      'O imóvel está inabitável. Há restos de alvenaria quebrada, fiação solta, lixo e paredes tomadas por infiltração e mofo.',
    badgeColor: 'text-amber-500 bg-amber-950/40 border-amber-800/60',
  },
  2: {
    id: 2,
    name: 'Limpeza',
    tagline: 'Desobstruído e higienizado',
    description:
      'Todo o entulho e poeira foram removidos. O espaço está livre para o início das obras de alvenaria e infraestrutura.',
    badgeColor: 'text-blue-400 bg-blue-950/40 border-blue-800/60',
  },
  3: {
    id: 3,
    name: 'Estrutura Recuperada',
    tagline: 'Paredes seladas e elétrica refeita',
    description:
      'As rachaduras foram tratadas, a rede elétrica foi reestruturada com segurança e o teto não apresenta mais goteiras.',
    badgeColor: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60',
  },
  4: {
    id: 4,
    name: 'Preparação',
    tagline: 'Acabamentos e portas instaladas',
    description:
      'Piso cerâmico nivelado, paredes com massa corrida e pintura uniforme, e novas esquadrias envidraçadas instaladas.',
    badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
  },
  5: {
    id: 5,
    name: 'Operacional',
    tagline: 'Pronto para abrir as portas',
    description:
      'Fachada revitalizada, letreiro elegante iluminado e instalações prontas para receber o primeiro negócio e gerar lucro!',
    badgeColor: 'text-emerald-300 bg-emerald-900/60 border-emerald-500',
  },
};

export const RESTORATION_ACTIONS: RestorationAction[] = [
  {
    id: 'retirar_entulho',
    name: 'Retirar Entulho e Sucata',
    category: 'Descarte',
    description:
      'Contratar caçamba e carregar toneladas de tijolos quebrados, madeiras podres e dejetos acumulados ao longo dos anos.',
    cost: 120,
    prerequisites: [],
    targetStage: 2,
    visualEffectDescription: 'Remove as pilhas de lixo, caixas podres e tijolos do interior do imóvel.',
    progressContribution: 12,
  },
  {
    id: 'fazer_limpeza',
    name: 'Limpeza Pesada & Higienização',
    category: 'Higienização',
    description:
      'Varrer a poeira grossa, desinfetar chão e teto, retirar teias de aranha e eliminar focos de umidade.',
    cost: 80,
    prerequisites: ['retirar_entulho'],
    targetStage: 2,
    visualEffectDescription: 'Elimina as teias de aranha e manchas densas de sujeira no chão de cimento.',
    progressContribution: 13,
  },
  {
    id: 'reparar_paredes',
    name: 'Reparar Alvenaria & Rachaduras',
    category: 'Estrutura',
    description:
      'Rebocar buracos nas paredes, aplicar impermeabilizante contra infiltrações e selar trincas estruturais.',
    cost: 250,
    prerequisites: ['fazer_limpeza'],
    targetStage: 3,
    visualEffectDescription: 'Paredes recuperadas sem tijolos à mostra e sem rachaduras escuras.',
    progressContribution: 15,
  },
  {
    id: 'consertar_eletricidade',
    name: 'Refazer Instalação Elétrica',
    category: 'Instalações',
    description:
      'Trocar fiações descascadas, instalar conduítes antichamas e montar um novo quadro de distribuição de energia com disjuntores.',
    cost: 320,
    prerequisites: ['reparar_paredes'],
    targetStage: 3,
    visualEffectDescription: 'Fios pendurados somem; caixa de luz e tubulações organizadas passam a conduzir energia.',
    progressContribution: 15,
  },
  {
    id: 'restaurar_piso',
    name: 'Assentar Piso Cerâmico',
    category: 'Acabamento',
    description:
      'Nivelar o contrapiso de cimento com argamassa autonivelante e assentar cerâmica durável de alto tráfego com rejunte cinza claro.',
    cost: 380,
    prerequisites: ['reparar_paredes'],
    targetStage: 4,
    visualEffectDescription: 'O chão de cimento áspero dá lugar a um piso cerâmico limpo e brilhante com reflexos sutis.',
    progressContribution: 15,
  },
  {
    id: 'trocar_portas_janelas',
    name: 'Instalar Portas & Vitrine de Vidro',
    category: 'Acabamento',
    description:
      'Substituir tapumes de madeira e janelas estilhaçadas por esquadrias de alumínio com vidro temperado de alta segurança.',
    cost: 340,
    prerequisites: ['consertar_eletricidade'],
    targetStage: 4,
    visualEffectDescription: 'A entrada ganha porta de vidro moderna transparente e esquadrias de alumínio novas.',
    progressContribution: 10,
  },
  {
    id: 'pintar_imovel',
    name: 'Pintura Interna e Externa',
    category: 'Acabamento',
    description:
      'Lixar superfícies, passar selador e aplicar duas demãos de tinta lavável de alto padrão nas paredes internas e externas.',
    cost: 260,
    prerequisites: ['restaurar_piso', 'trocar_portas_janelas'],
    targetStage: 4,
    visualEffectDescription: 'Paredes ganham cor viva, limpa e acabamento moderno.',
    progressContribution: 10,
  },
  {
    id: 'restaurar_fachada',
    name: 'Fachada & Letreiro Comercial',
    category: 'Identidade',
    description:
      'Instalar iluminação externa em LED, marquise renovada e letreiro personalizado com o nome do seu futuro empreendimento.',
    cost: 420,
    prerequisites: ['pintar_imovel'],
    targetStage: 5,
    visualEffectDescription: 'Fachada impecável com letreiro iluminado da sua empresa e calçada frontal pavimentada.',
    progressContribution: 10,
  },
];

export const TEMPORARY_JOBS: TemporaryJob[] = [
  {
    id: 'panfletagem',
    title: 'Panfletagem no Semáforo',
    employer: 'Restaurante Central',
    category: 'Marketing de Rua',
    description:
      'Passar o dia sob o sol distribuindo cupons promocionais para motoristas e pedestres na avenida comercial.',
    basePay: 70,
    tipChance: 0.35,
    maxTip: 25,
    narrativeOutcome: 'Você distribuiu mais de 600 panfletos e conversou com diversos comerciantes da região.',
  },
  {
    id: 'ajudante_ceasa',
    title: 'Ajudante de Carga no Ceasa',
    employer: 'Distribuidora Horta Boa',
    category: 'Trabalho Braçal',
    description:
      'Descarregar caminhões de hortifrúti, empilhar caixotes pesados e organizar o galpão de distribuição.',
    basePay: 120,
    tipChance: 0.25,
    maxTip: 35,
    narrativeOutcome: 'Trabalho pesado e puxado, mas o feirante elogiou sua pontualidade e pagou a diária com bônus.',
  },
  {
    id: 'servente_obra',
    title: 'Servente em Obra Vizinha',
    employer: 'Construtora Silva',
    category: 'Construção Civil',
    description:
      'Misturar concreto, transportar carrinhos de tijolos e auxiliar o mestre de obras na reforma de um sobrado.',
    basePay: 140,
    tipChance: 0.3,
    maxTip: 40,
    narrativeOutcome: 'O mestre de obras gostou da sua dedicação e ainda te deu dicas valiosas sobre restauração!',
  },
  {
    id: 'faxina_loja',
    title: 'Faxina Pesada Comercial',
    employer: 'Boutique Elegância',
    category: 'Serviços Gerais',
    description:
      'Fazer faxina detalhada pós-reforma em uma loja de roupas antes da grande inauguração de fim de semana.',
    basePay: 95,
    tipChance: 0.4,
    maxTip: 30,
    narrativeOutcome: 'A dona da boutique ficou impressionada com o brilho dos vidros e pagou uma boa gorjeta.',
  },
  {
    id: 'entregador_bike',
    title: 'Entregador Noturno de Bicicleta',
    employer: 'Pizzaria Bella Napoli',
    category: 'Logística',
    description:
      'Fazer entregas rápidas pelas ruas do bairro pedalando contra o relógio para entregar os pedidos quentes.',
    basePay: 135,
    tipChance: 0.5,
    maxTip: 45,
    narrativeOutcome: 'Muitas entregas subindo e descendo ladeiras. Os clientes gostaram da agilidade.',
  },
];

export const FUTURE_ENTERPRISES: FutureEnterprise[] = [
  {
    id: 'grafica',
    name: 'Gráfica Expressa & Copiadora',
    category: 'Serviços',
    description:
      'Impressões de banner, encadernações, cópias e materiais publicitários para os escritórios e estudantes da cidade.',
    estimatedInvestment: 2400,
    minStageRequired: 5,
    revenuePotential: 'Médio',
    complexity: 'Iniciante',
    keyEquipment: ['Plotter de Impressão', 'Guilhotina Hidráulica', 'Computador de Design', 'Encadernadora'],
  },
  {
    id: 'roupas',
    name: 'Loja de Vestuário & Moda Urbana',
    category: 'Varejo',
    description:
      'Venda de roupas casuais, calçados e acessórios selecionados com boa margem de revenda.',
    estimatedInvestment: 3800,
    minStageRequired: 5,
    revenuePotential: 'Alto',
    complexity: 'Intermediário',
    keyEquipment: ['Araras e Provadores', 'Estoque de Peças', 'Manequins de Vitrine', 'PDV com Leitor'],
  },
  {
    id: 'eletronicos',
    name: 'Assistência Técnica de Celulares e Informática',
    category: 'Tecnologia',
    description:
      'Conserto de smartphones, notebooks, troca de telas e venda de periféricos tecnológicos de alta demanda.',
    estimatedInvestment: 4500,
    minStageRequired: 5,
    revenuePotential: 'Alto',
    complexity: 'Intermediário',
    keyEquipment: ['Estação de Solda & Retrabalho', 'Microscópio Estereoscópico', 'Kit de Telas e Baterias'],
  },
  {
    id: 'padaria',
    name: 'Padaria & Café Artesanal',
    category: 'Alimentação',
    description:
      'Pães de fermentação natural, café expresso, salgados assados e doces para o público matinal e da tarde.',
    estimatedInvestment: 6500,
    minStageRequired: 5,
    revenuePotential: 'Muito Alto',
    complexity: 'Avançado',
    keyEquipment: ['Forno Turbo Industrial', 'Masseira Espiral', 'Máquina de Café Espresso', 'Vitrine Refrigerada'],
  },
  {
    id: 'restaurante',
    name: 'Restaurante & Marmitaria Executiva',
    category: 'Alimentação',
    description:
      'Buffet a quilo e marmitas para os trabalhadores dos comércios e bancos da vizinhança.',
    estimatedInvestment: 8200,
    minStageRequired: 5,
    revenuePotential: 'Muito Alto',
    complexity: 'Avançado',
    keyEquipment: ['Fogão Industrial 6 Bocas', 'Câmara Fria', 'Pass-Through Aquecido', 'Coifa e Exaustor'],
  },
  {
    id: 'estudio',
    name: 'Estúdio Criativo & Fotografia',
    category: 'Criativo',
    description:
      'Ensaios fotográficos, fotos de produtos para e-commerce local e gravação de podcasts empresariais.',
    estimatedInvestment: 5100,
    minStageRequired: 5,
    revenuePotential: 'Médio',
    complexity: 'Intermediário',
    keyEquipment: ['Painéis de Iluminação Softbox', 'Fundos Infinitos', 'Câmeras Mirrorless', 'Isolamento Acústico'],
  },
];
