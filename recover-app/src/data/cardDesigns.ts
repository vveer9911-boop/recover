export type CardCategory =
  | 'Classic'
  | 'Weave'
  | 'Urban'
  | 'Carbon'
  | 'Contour'
  | 'Prism'
  | 'Circuit'
  | 'Signature';

export type PatternType =
  // Classic
  | 'classic-arctic-silver'
  | 'classic-titanium'
  | 'classic-obsidian-black'
  | 'classic-gold'
  | 'classic-rose-gold'
  | 'classic-lavender'
  // Weave
  | 'weave-diagonal'
  | 'weave-interlocking'
  | 'weave-threads'
  | 'weave-tight'
  | 'weave-offset'
  | 'weave-tonal'
  | 'weave-crosshatch'
  // Urban
  | 'urban-grid'
  | 'urban-silhouette'
  | 'urban-concrete'
  | 'urban-steel'
  | 'urban-rectangular'
  | 'urban-structural'
  | 'urban-geometry'
  // Carbon
  | 'carbon-fiber'
  | 'carbon-graphite'
  | 'carbon-black'
  | 'carbon-circuitry'
  | 'carbon-steel'
  | 'carbon-surface'
  | 'carbon-layered'
  // Contour
  | 'contour-elevation'
  | 'contour-parallel'
  | 'contour-terrain'
  | 'contour-relief'
  | 'contour-landscapes'
  | 'contour-carved'
  | 'contour-symmetrical'
  // Prism
  | 'prism-panels'
  | 'prism-facets'
  | 'prism-metallic'
  | 'prism-triangular'
  | 'prism-blocking'
  | 'prism-reflective'
  | 'prism-asymmetric'
  // Circuit
  | 'circuit-traces'
  | 'circuit-schematic'
  | 'circuit-pathways'
  | 'circuit-connections'
  | 'circuit-nodes'
  | 'circuit-micro'
  | 'circuit-structured'
  // Signature
  | 'signature-borders'
  | 'signature-pinstripes'
  | 'signature-corners'
  | 'signature-embossed'
  | 'signature-metallic'
  | 'signature-linework'
  | 'signature-layered';

export interface CardDesign {
  id: string;
  name: string;
  category: CardCategory;
  description: string;
  patternType: PatternType;
  palette: {
    gradient: [string, string, ...string[]];
    gradientStart?: { x: number; y: number };
    gradientEnd?: { x: number; y: number };
    borderColor: string;
    textColor: string;
    subtextColor: string;
    chipBorder?: string;
    chipFill?: string;
    chevronColor: string;
    highlightColor?: string;
    accentColor?: string;
  };
}

export interface CategoryInfo {
  id: CardCategory;
  title: string;
  description: string;
  cards: CardDesign[];
}

export const CARD_DESIGNS: CardDesign[] = [
  // =========================================================================
  // 1. CLASSIC COLLECTION (Exactly 6 Cards)
  // =========================================================================
  {
    id: 'classic-arctic-silver',
    name: 'Arctic Silver',
    category: 'Classic',
    description: 'Brushed silver, charcoal typography, fine metallic linework.',
    patternType: 'classic-arctic-silver',
    palette: {
      gradient: ['#F2F2F5', '#E1E1E6', '#C8C8D0'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.8, y: 1 },
      borderColor: 'rgba(0, 0, 0, 0.25)',
      textColor: '#161618',
      subtextColor: '#4B4B52',
      chevronColor: '#6B6B74',
      chipBorder: '#8E8E93',
      chipFill: '#D1D1D6',
      highlightColor: 'rgba(255, 255, 255, 0.65)',
    },
  },
  {
    id: 'classic-titanium',
    name: 'Titanium',
    category: 'Classic',
    description: 'Neutral titanium, satin silver details, minimal precise styling.',
    patternType: 'classic-titanium',
    palette: {
      gradient: ['#7A7A80', '#636368', '#4E4E54'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.85, y: 1 },
      borderColor: 'rgba(255, 255, 255, 0.3)',
      textColor: '#FFFFFF',
      subtextColor: '#D1D1D6',
      chevronColor: '#E5E5EA',
      chipBorder: '#FFFFFF',
      chipFill: '#5C5C62',
      highlightColor: 'rgba(255, 255, 255, 0.22)',
    },
  },
  {
    id: 'classic-obsidian-black',
    name: 'Obsidian Black',
    category: 'Classic',
    description: 'Deep matte black with fine satin highlights and edge definition.',
    patternType: 'classic-obsidian-black',
    palette: {
      gradient: ['#28282A', '#19191B', '#0E0E10'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(255, 255, 255, 0.22)',
      textColor: '#FFFFFF',
      subtextColor: '#A1A1A6',
      chevronColor: '#D4D4D8',
      chipBorder: '#E5E5EA',
      chipFill: '#242426',
      highlightColor: 'rgba(255, 255, 255, 0.12)',
    },
  },
  {
    id: 'classic-gold',
    name: 'Gold',
    category: 'Classic',
    description: 'Warm champagne-gold with brushed satin metallic finish.',
    patternType: 'classic-gold',
    palette: {
      gradient: ['#E6DCC9', '#D2C3A5', '#B8A682'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(168, 148, 112, 0.40)',
      textColor: '#241E15',
      subtextColor: '#5E523E',
      chevronColor: '#7D6F56',
      chipBorder: '#8A7B60',
      chipFill: '#D5C7AC',
      highlightColor: 'rgba(255, 255, 255, 0.55)',
    },
  },
  {
    id: 'classic-rose-gold',
    name: 'Rose Gold',
    category: 'Classic',
    description: 'Muted metallic rose-gold with delicate pink champagne luster.',
    patternType: 'classic-rose-gold',
    palette: {
      gradient: ['#E2B7BE', '#C9939B', '#A76E78'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(255, 255, 255, 0.35)',
      textColor: '#FFFFFF',
      subtextColor: '#FCE7EA',
      chevronColor: '#F5D0D6',
      chipBorder: '#FFFFFF',
      chipFill: '#C28892',
      highlightColor: 'rgba(255, 255, 255, 0.45)',
    },
  },
  {
    id: 'classic-lavender',
    name: 'Lavender',
    category: 'Classic',
    description: 'Soft light lavender-purple with a cool silvery metallic sheen.',
    patternType: 'classic-lavender',
    palette: {
      gradient: ['#DDD8E6', '#C6C0D4', '#ABA4B8'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.85, y: 1 },
      borderColor: 'rgba(125, 115, 145, 0.35)',
      textColor: '#241D30',
      subtextColor: '#574E66',
      chevronColor: '#786C8C',
      chipBorder: '#8A7D9E',
      chipFill: '#CCC6D9',
      highlightColor: 'rgba(255, 255, 255, 0.65)',
    },
  },

  // =========================================================================
  // 2. WEAVE COLLECTION (7 Gallery Cards)
  // =========================================================================
  {
    id: 'weave-diagonal',
    name: 'Diagonal Weave',
    category: 'Weave',
    description: 'Fine diagonal weaving with subtle depth.',
    patternType: 'weave-diagonal',
    palette: {
      gradient: ['#3A3A3E', '#2B2B2E', '#1C1C1F'],
      borderColor: 'rgba(255, 255, 255, 0.22)',
      textColor: '#FFFFFF',
      subtextColor: '#A1A1AA',
      chevronColor: '#E4E4E7',
      chipBorder: '#D4D4D8',
      chipFill: '#27272A',
    },
  },
  {
    id: 'weave-interlocking',
    name: 'Interlock',
    category: 'Weave',
    description: 'Interlocking bands with alternating metallic tones.',
    patternType: 'weave-interlocking',
    palette: {
      gradient: ['#253646', '#1A2835', '#101B24'],
      borderColor: 'rgba(56, 189, 248, 0.4)',
      textColor: '#FFFFFF',
      subtextColor: '#BAE6FD',
      chevronColor: '#38BDF8',
      chipBorder: '#7DD3FC',
      chipFill: '#1E293B',
    },
  },
  {
    id: 'weave-threads',
    name: 'Layered Thread',
    category: 'Weave',
    description: 'Precision layered threads in slate and crimson.',
    patternType: 'weave-threads',
    palette: {
      gradient: ['#442332', '#301824', '#1E0E16'],
      borderColor: 'rgba(244, 63, 94, 0.38)',
      textColor: '#FFFFFF',
      subtextColor: '#FECDD3',
      chevronColor: '#FB7185',
      chipBorder: '#FDA4AF',
      chipFill: '#4C0519',
    },
  },
  {
    id: 'weave-tight',
    name: 'Tight Weave',
    category: 'Weave',
    description: 'Dense micro-woven fabric texture with clean edge definition.',
    patternType: 'weave-tight',
    palette: {
      gradient: ['#2A2E33', '#1F2327', '#14171A'],
      borderColor: 'rgba(148, 163, 184, 0.3)',
      textColor: '#FFFFFF',
      subtextColor: '#CBD5E1',
      chevronColor: '#94A3B8',
      chipBorder: '#E2E8F0',
      chipFill: '#1E293B',
    },
  },
  {
    id: 'weave-offset',
    name: 'Offset Band',
    category: 'Weave',
    description: 'Offset geometric strips in rich contrast.',
    patternType: 'weave-offset',
    palette: {
      gradient: ['#3A362D', '#2B2720', '#1C1914'],
      borderColor: 'rgba(234, 179, 8, 0.35)',
      textColor: '#FFFFFF',
      subtextColor: '#FEF08A',
      chevronColor: '#EAB308',
      chipBorder: '#FDE047',
      chipFill: '#422006',
    },
  },
  {
    id: 'weave-tonal',
    name: 'Tonal Weave',
    category: 'Weave',
    description: 'Subtle tonal weaving with satin sheen.',
    patternType: 'weave-tonal',
    palette: {
      gradient: ['#233833', '#172723', '#0E1A17'],
      borderColor: 'rgba(45, 212, 191, 0.4)',
      textColor: '#FFFFFF',
      subtextColor: '#99F6E4',
      chevronColor: '#2DD4BF',
      chipBorder: '#5EEAD4',
      chipFill: '#134E4A',
    },
  },
  {
    id: 'weave-crosshatch',
    name: 'Crosshatch',
    category: 'Weave',
    description: 'Precision crosshatch engraving on matte carbon.',
    patternType: 'weave-crosshatch',
    palette: {
      gradient: ['#333338', '#25252A', '#18181C'],
      borderColor: 'rgba(255, 255, 255, 0.25)',
      textColor: '#FFFFFF',
      subtextColor: '#D4D4D8',
      chevronColor: '#A1A1AA',
      chipBorder: '#E4E4E7',
      chipFill: '#27272A',
    },
  },

  // =========================================================================
  // 3. URBAN COLLECTION (7 Gallery Cards)
  // =========================================================================
  {
    id: 'urban-grid',
    name: 'Metro Grid',
    category: 'Urban',
    description: 'Architectural grids and structural coordinates.',
    patternType: 'urban-grid',
    palette: {
      gradient: ['#2D3239', '#21252B', '#16191E'],
      borderColor: 'rgba(148, 163, 184, 0.35)',
      textColor: '#FFFFFF',
      subtextColor: '#CBD5E1',
      chevronColor: '#38BDF8',
      chipBorder: '#94A3B8',
      chipFill: '#1E293B',
    },
  },
  {
    id: 'urban-silhouette',
    name: 'Skyline',
    category: 'Urban',
    description: 'Abstract building silhouettes in layered dusk tones.',
    patternType: 'urban-silhouette',
    palette: {
      gradient: ['#382E47', '#281F34', '#1A1422'],
      borderColor: 'rgba(192, 132, 252, 0.38)',
      textColor: '#FFFFFF',
      subtextColor: '#E9D5FF',
      chevronColor: '#C084FC',
      chipBorder: '#DDD6FE',
      chipFill: '#3B0764',
    },
  },
  {
    id: 'urban-concrete',
    name: 'Raw Concrete',
    category: 'Urban',
    description: 'Geometric concrete with industrial precision.',
    patternType: 'urban-concrete',
    palette: {
      gradient: ['#E6E6E8', '#D4D4D8', '#B8B8BD'],
      borderColor: 'rgba(0, 0, 0, 0.28)',
      textColor: '#18181B',
      subtextColor: '#52525B',
      chevronColor: '#3F3F46',
      chipBorder: '#71717A',
      chipFill: '#D4D4D8',
    },
  },
  {
    id: 'urban-steel',
    name: 'Industrial Steel',
    category: 'Urban',
    description: 'Industrial brushed steel surfaces with exposed fasteners.',
    patternType: 'urban-steel',
    palette: {
      gradient: ['#6B7280', '#4B5563', '#374151'],
      borderColor: 'rgba(255, 255, 255, 0.32)',
      textColor: '#FFFFFF',
      subtextColor: '#E5E7EB',
      chevronColor: '#F3F4F6',
      chipBorder: '#FFFFFF',
      chipFill: '#4B5563',
    },
  },
  {
    id: 'urban-rectangular',
    name: 'Monolith',
    category: 'Urban',
    description: 'Layered rectangular architectural forms.',
    patternType: 'urban-rectangular',
    palette: {
      gradient: ['#282A2E', '#1C1D20', '#121315'],
      borderColor: 'rgba(255, 255, 255, 0.2)',
      textColor: '#FFFFFF',
      subtextColor: '#A1A1AA',
      chevronColor: '#E4E4E7',
      chipBorder: '#D4D4D8',
      chipFill: '#27272A',
    },
  },
  {
    id: 'urban-structural',
    name: 'Scaffold',
    category: 'Urban',
    description: 'Structural linework and beam geometry.',
    patternType: 'urban-structural',
    palette: {
      gradient: ['#443828', '#32281B', '#201910'],
      borderColor: 'rgba(251, 146, 60, 0.42)',
      textColor: '#FFFFFF',
      subtextColor: '#FED7AA',
      chevronColor: '#FB923C',
      chipBorder: '#FDBA74',
      chipFill: '#431407',
    },
  },
  {
    id: 'urban-geometry',
    name: 'Brutalist',
    category: 'Urban',
    description: 'Minimal urban geometry with bold typographic rhythm.',
    patternType: 'urban-geometry',
    palette: {
      gradient: ['#202224', '#17181A', '#0D0E0F'],
      borderColor: 'rgba(255, 255, 255, 0.3)',
      textColor: '#FFFFFF',
      subtextColor: '#D4D4D8',
      chevronColor: '#E4E4E7',
      chipBorder: '#FFFFFF',
      chipFill: '#27272A',
    },
  },

  // =========================================================================
  // 4. CARBON COLLECTION (7 Gallery Cards)
  // =========================================================================
  {
    id: 'carbon-fiber',
    name: 'Carbon Fiber',
    category: 'Carbon',
    description: 'True twill carbon-fiber weave pattern.',
    patternType: 'carbon-fiber',
    palette: {
      gradient: ['#2A2A2E', '#1D1D20', '#121214'],
      borderColor: 'rgba(255, 255, 255, 0.24)',
      textColor: '#FFFFFF',
      subtextColor: '#A1A1AA',
      chevronColor: '#D4D4D8',
      chipBorder: '#E4E4E7',
      chipFill: '#27272A',
    },
  },
  {
    id: 'carbon-graphite',
    name: 'Brushed Graphite',
    category: 'Carbon',
    description: 'Brushed graphite with satin reflection.',
    patternType: 'carbon-graphite',
    palette: {
      gradient: ['#424248', '#313137', '#222226'],
      borderColor: 'rgba(255, 255, 255, 0.28)',
      textColor: '#FFFFFF',
      subtextColor: '#D4D4D8',
      chevronColor: '#E4E4E7',
      chipBorder: '#FFFFFF',
      chipFill: '#3F3F46',
    },
  },
  {
    id: 'carbon-black',
    name: 'Stealth Carbon',
    category: 'Carbon',
    description: 'Black-on-black matte geometry with subtle sheen.',
    patternType: 'carbon-black',
    palette: {
      gradient: ['#1C1C1E', '#141416', '#0A0A0C'],
      borderColor: 'rgba(255, 255, 255, 0.18)',
      textColor: '#FFFFFF',
      subtextColor: '#71717A',
      chevronColor: '#A1A1AA',
      chipBorder: '#71717A',
      chipFill: '#18181B',
    },
  },
  {
    id: 'carbon-circuitry',
    name: 'Chassis',
    category: 'Carbon',
    description: 'Fine metallic circuitry inlaid on carbon composite.',
    patternType: 'carbon-circuitry',
    palette: {
      gradient: ['#1E2C33', '#141E24', '#0C1317'],
      borderColor: 'rgba(45, 212, 191, 0.45)',
      textColor: '#FFFFFF',
      subtextColor: '#99F6E4',
      chevronColor: '#2DD4BF',
      chipBorder: '#5EEAD4',
      chipFill: '#134E4A',
    },
  },
  {
    id: 'carbon-steel',
    name: 'Forged Carbon',
    category: 'Carbon',
    description: 'Satin steel accents on marbled composite.',
    patternType: 'carbon-steel',
    palette: {
      gradient: ['#4B4B52', '#36363C', '#242428'],
      borderColor: 'rgba(255, 255, 255, 0.28)',
      textColor: '#FFFFFF',
      subtextColor: '#D4D4D8',
      chevronColor: '#E4E4E7',
      chipBorder: '#F4F4F5',
      chipFill: '#3F3F46',
    },
  },
  {
    id: 'carbon-surface',
    name: 'Aero Weave',
    category: 'Carbon',
    description: 'Technical surface patterns with aerodynamic flow.',
    patternType: 'carbon-surface',
    palette: {
      gradient: ['#2F353B', '#21262B', '#15191C'],
      borderColor: 'rgba(148, 163, 184, 0.32)',
      textColor: '#FFFFFF',
      subtextColor: '#CBD5E1',
      chevronColor: '#94A3B8',
      chipBorder: '#CBD5E1',
      chipFill: '#1E293B',
    },
  },
  {
    id: 'carbon-layered',
    name: 'Matrix',
    category: 'Carbon',
    description: 'Layered multi-axial carbon textures.',
    patternType: 'carbon-layered',
    palette: {
      gradient: ['#26262B', '#1B1B1E', '#101012'],
      borderColor: 'rgba(255, 255, 255, 0.2)',
      textColor: '#FFFFFF',
      subtextColor: '#A1A1AA',
      chevronColor: '#C4C4C8',
      chipBorder: '#E4E4E7',
      chipFill: '#27272A',
    },
  },

  // =========================================================================
  // 5. CONTOUR COLLECTION (7 Gallery Cards)
  // =========================================================================
  {
    id: 'contour-elevation',
    name: 'Topography',
    category: 'Contour',
    description: 'Topographic elevation lines with depth gradients.',
    patternType: 'contour-elevation',
    palette: {
      gradient: ['#23303D', '#17222C', '#0E161D'],
      borderColor: 'rgba(56, 189, 248, 0.42)',
      textColor: '#FFFFFF',
      subtextColor: '#BAE6FD',
      chevronColor: '#38BDF8',
      chipBorder: '#7DD3FC',
      chipFill: '#0C4A6E',
    },
  },
  {
    id: 'contour-parallel',
    name: 'Parallel Drift',
    category: 'Contour',
    description: 'Flowing parallel engravings with smooth undulations.',
    patternType: 'contour-parallel',
    palette: {
      gradient: ['#383244', '#282332', '#1B1722'],
      borderColor: 'rgba(168, 85, 247, 0.4)',
      textColor: '#FFFFFF',
      subtextColor: '#E9D5FF',
      chevronColor: '#C084FC',
      chipBorder: '#DDD6FE',
      chipFill: '#3B0764',
    },
  },
  {
    id: 'contour-terrain',
    name: 'Alpine Terrain',
    category: 'Contour',
    description: 'Layered mountain terrain contours in silvered slate.',
    patternType: 'contour-terrain',
    palette: {
      gradient: ['#DCE0E6', '#C6CCD6', '#A9B2C0'],
      borderColor: 'rgba(0, 0, 0, 0.28)',
      textColor: '#1E293B',
      subtextColor: '#475569',
      chevronColor: '#334155',
      chipBorder: '#64748B',
      chipFill: '#CBD5E1',
    },
  },
  {
    id: 'contour-relief',
    name: 'Bas-Relief',
    category: 'Contour',
    description: 'Fine-line relief engraving with light-catching edges.',
    patternType: 'contour-relief',
    palette: {
      gradient: ['#3A3C42', '#292B30', '#1B1C20'],
      borderColor: 'rgba(255, 255, 255, 0.26)',
      textColor: '#FFFFFF',
      subtextColor: '#D4D4D8',
      chevronColor: '#E4E4E7',
      chipBorder: '#FFFFFF',
      chipFill: '#27272A',
    },
  },
  {
    id: 'contour-landscapes',
    name: 'Meridian',
    category: 'Contour',
    description: 'Abstract landscape isotherms and contour arcs.',
    patternType: 'contour-landscapes',
    palette: {
      gradient: ['#223933', '#162723', '#0C1815'],
      borderColor: 'rgba(52, 211, 153, 0.4)',
      textColor: '#FFFFFF',
      subtextColor: '#A7F3D0',
      chevronColor: '#34D399',
      chipBorder: '#6EE7B7',
      chipFill: '#064E3B',
    },
  },
  {
    id: 'contour-carved',
    name: 'Carved Ridge',
    category: 'Contour',
    description: 'Precision-carved ridge lines on blasted titanium.',
    patternType: 'contour-carved',
    palette: {
      gradient: ['#52525A', '#3C3C43', '#2A2A2F'],
      borderColor: 'rgba(255, 255, 255, 0.3)',
      textColor: '#FFFFFF',
      subtextColor: '#E4E4E7',
      chevronColor: '#F4F4F5',
      chipBorder: '#FFFFFF',
      chipFill: '#3F3F46',
    },
  },
  {
    id: 'contour-symmetrical',
    name: 'Isobar',
    category: 'Contour',
    description: 'Symmetrical rhythmic contour waves.',
    patternType: 'contour-symmetrical',
    palette: {
      gradient: ['#2A2B35', '#1D1E26', '#121319'],
      borderColor: 'rgba(129, 140, 248, 0.42)',
      textColor: '#FFFFFF',
      subtextColor: '#C7D2FE',
      chevronColor: '#818CF8',
      chipBorder: '#A5B4FC',
      chipFill: '#1E1B4B',
    },
  },

  // =========================================================================
  // 6. PRISM COLLECTION (7 Gallery Cards)
  // =========================================================================
  {
    id: 'prism-panels',
    name: 'Facet',
    category: 'Prism',
    description: 'Angular polygonal panels with metallic specular highlights.',
    patternType: 'prism-panels',
    palette: {
      gradient: ['#3A3A40', '#28282D', '#19191C'],
      borderColor: 'rgba(255, 255, 255, 0.28)',
      textColor: '#FFFFFF',
      subtextColor: '#D4D4D8',
      chevronColor: '#E4E4E7',
      chipBorder: '#FFFFFF',
      chipFill: '#27272A',
    },
  },
  {
    id: 'prism-facets',
    name: 'Crystal',
    category: 'Prism',
    description: 'Layered geometric facets in crystalline obsidian.',
    patternType: 'prism-facets',
    palette: {
      gradient: ['#2B3545', '#1B2330', '#0E141E'],
      borderColor: 'rgba(96, 165, 250, 0.45)',
      textColor: '#FFFFFF',
      subtextColor: '#BFDBFE',
      chevronColor: '#60A5FA',
      chipBorder: '#93C5FD',
      chipFill: '#172554',
    },
  },
  {
    id: 'prism-metallic',
    name: 'Chroma',
    category: 'Prism',
    description: 'Metallic sections with refractive tonal shifts.',
    patternType: 'prism-metallic',
    palette: {
      gradient: ['#47384A', '#332736', '#211824'],
      borderColor: 'rgba(232, 121, 249, 0.42)',
      textColor: '#FFFFFF',
      subtextColor: '#F5D0FE',
      chevronColor: '#E879F9',
      chipBorder: '#F0ABFC',
      chipFill: '#4A044E',
    },
  },
  {
    id: 'prism-triangular',
    name: 'Delta',
    category: 'Prism',
    description: 'Minimal interlocking triangular forms.',
    patternType: 'prism-triangular',
    palette: {
      gradient: ['#303338', '#212428', '#141619'],
      borderColor: 'rgba(255, 255, 255, 0.25)',
      textColor: '#FFFFFF',
      subtextColor: '#D4D4D8',
      chevronColor: '#A1A1AA',
      chipBorder: '#E4E4E7',
      chipFill: '#27272A',
    },
  },
  {
    id: 'prism-blocking',
    name: 'Spectrum',
    category: 'Prism',
    description: 'Restrained geometric color blocking in muted jewel tones.',
    patternType: 'prism-blocking',
    palette: {
      gradient: ['#283D36', '#1A2A25', '#0E1A16'],
      borderColor: 'rgba(45, 212, 191, 0.42)',
      textColor: '#FFFFFF',
      subtextColor: '#99F6E4',
      chevronColor: '#2DD4BF',
      chipBorder: '#5EEAD4',
      chipFill: '#042F2E',
    },
  },
  {
    id: 'prism-reflective',
    name: 'Prismatic Edge',
    category: 'Prism',
    description: 'Subtle reflective edges with bevel definition.',
    patternType: 'prism-reflective',
    palette: {
      gradient: ['#4F4F57', '#38383F', '#24242A'],
      borderColor: 'rgba(255, 255, 255, 0.32)',
      textColor: '#FFFFFF',
      subtextColor: '#E4E4E7',
      chevronColor: '#FAFAFA',
      chipBorder: '#FFFFFF',
      chipFill: '#3F3F46',
    },
  },
  {
    id: 'prism-asymmetric',
    name: 'Origami',
    category: 'Prism',
    description: 'Asymmetric angular folds in titanium foil.',
    patternType: 'prism-asymmetric',
    palette: {
      gradient: ['#3B3A36', '#2A2926', '#1A1917'],
      borderColor: 'rgba(250, 204, 21, 0.38)',
      textColor: '#FFFFFF',
      subtextColor: '#FEF08A',
      chevronColor: '#FACC15',
      chipBorder: '#FDE047',
      chipFill: '#422006',
    },
  },

  // =========================================================================
  // 7. CIRCUIT COLLECTION (7 Gallery Cards)
  // =========================================================================
  {
    id: 'circuit-traces',
    name: 'Silicon Bus',
    category: 'Circuit',
    description: 'Fine micro-circuit traces with via pads.',
    patternType: 'circuit-traces',
    palette: {
      gradient: ['#252C36', '#191E25', '#0F1318'],
      borderColor: 'rgba(56, 189, 248, 0.44)',
      textColor: '#FFFFFF',
      subtextColor: '#BAE6FD',
      chevronColor: '#38BDF8',
      chipBorder: '#7DD3FC',
      chipFill: '#0C4A6E',
    },
  },
  {
    id: 'circuit-schematic',
    name: 'Schematic',
    category: 'Circuit',
    description: 'Technical engineering schematic in silver traces.',
    patternType: 'circuit-schematic',
    palette: {
      gradient: ['#2A2E33', '#1D2024', '#121417'],
      borderColor: 'rgba(255, 255, 255, 0.28)',
      textColor: '#FFFFFF',
      subtextColor: '#CBD5E1',
      chevronColor: '#94A3B8',
      chipBorder: '#E2E8F0',
      chipFill: '#1E293B',
    },
  },
  {
    id: 'circuit-pathways',
    name: 'Dual Bus',
    category: 'Circuit',
    description: 'Symmetrical dual-channel data pathways.',
    patternType: 'circuit-pathways',
    palette: {
      gradient: ['#2B2B30', '#1E1E22', '#131316'],
      borderColor: 'rgba(255, 255, 255, 0.24)',
      textColor: '#FFFFFF',
      subtextColor: '#D4D4D8',
      chevronColor: '#C4C4C8',
      chipBorder: '#FFFFFF',
      chipFill: '#27272A',
    },
  },
  {
    id: 'circuit-connections',
    name: 'Interconnect',
    category: 'Circuit',
    description: 'Engraved golden connection routes on matte black.',
    patternType: 'circuit-connections',
    palette: {
      gradient: ['#2D2A20', '#1F1C14', '#13110B'],
      borderColor: 'rgba(234, 179, 8, 0.45)',
      textColor: '#FFFFFF',
      subtextColor: '#FEF08A',
      chevronColor: '#EAB308',
      chipBorder: '#FACC15',
      chipFill: '#422006',
    },
  },
  {
    id: 'circuit-nodes',
    name: 'Logic Node',
    category: 'Circuit',
    description: 'Minimal connection nodes and micro-resistors.',
    patternType: 'circuit-nodes',
    palette: {
      gradient: ['#1E332E', '#142320', '#0B1513'],
      borderColor: 'rgba(45, 212, 191, 0.44)',
      textColor: '#FFFFFF',
      subtextColor: '#99F6E4',
      chevronColor: '#2DD4BF',
      chipBorder: '#5EEAD4',
      chipFill: '#042F2E',
    },
  },
  {
    id: 'circuit-micro',
    name: 'Micro Trace',
    category: 'Circuit',
    description: 'Precision high-density micro-linework.',
    patternType: 'circuit-micro',
    palette: {
      gradient: ['#383344', '#26222F', '#18151E'],
      borderColor: 'rgba(192, 132, 252, 0.42)',
      textColor: '#FFFFFF',
      subtextColor: '#E9D5FF',
      chevronColor: '#C084FC',
      chipBorder: '#DDD6FE',
      chipFill: '#3B0764',
    },
  },
  {
    id: 'circuit-structured',
    name: 'Quantum Grid',
    category: 'Circuit',
    description: 'Structured circuit lattice with glowing junction points.',
    patternType: 'circuit-structured',
    palette: {
      gradient: ['#232B3A', '#161C27', '#0C1017'],
      borderColor: 'rgba(96, 165, 250, 0.44)',
      textColor: '#FFFFFF',
      subtextColor: '#BFDBFE',
      chevronColor: '#60A5FA',
      chipBorder: '#93C5FD',
      chipFill: '#172554',
    },
  },

  // =========================================================================
  // 8. SIGNATURE COLLECTION (7 Gallery Cards)
  // =========================================================================
  {
    id: 'signature-borders',
    name: 'Executive',
    category: 'Signature',
    description: 'Fine ornamental micro-borders and corner brackets.',
    patternType: 'signature-borders',
    palette: {
      gradient: ['#2C2D33', '#1F2024', '#141417'],
      borderColor: 'rgba(255, 255, 255, 0.32)',
      textColor: '#FFFFFF',
      subtextColor: '#D4D4D8',
      chevronColor: '#E4E4E7',
      chipBorder: '#FFFFFF',
      chipFill: '#27272A',
    },
  },
  {
    id: 'signature-pinstripes',
    name: 'Pinstripe',
    category: 'Signature',
    description: 'Elegant hairline metallic pinstripes.',
    patternType: 'signature-pinstripes',
    palette: {
      gradient: ['#3D3A34', '#2B2924', '#1B1A17'],
      borderColor: 'rgba(217, 119, 6, 0.4)',
      textColor: '#FFFFFF',
      subtextColor: '#FDE68A',
      chevronColor: '#F59E0B',
      chipBorder: '#FCD34D',
      chipFill: '#451A03',
    },
  },
  {
    id: 'signature-corners',
    name: 'Artisan',
    category: 'Signature',
    description: 'Engraved corner filigree and geometric hallmarks.',
    patternType: 'signature-corners',
    palette: {
      gradient: ['#36363B', '#26262A', '#18181B'],
      borderColor: 'rgba(255, 255, 255, 0.28)',
      textColor: '#FFFFFF',
      subtextColor: '#D4D4D8',
      chevronColor: '#D8D8DB',
      chipBorder: '#E5E5EA',
      chipFill: '#27272A',
    },
  },
  {
    id: 'signature-embossed',
    name: 'Emboss',
    category: 'Signature',
    description: 'Subtle three-dimensional frame embossing.',
    patternType: 'signature-embossed',
    palette: {
      gradient: ['#F5F5F7', '#E5E5EA', '#CECED4'],
      borderColor: 'rgba(0, 0, 0, 0.22)',
      textColor: '#1C1C1E',
      subtextColor: '#48484A',
      chevronColor: '#636366',
      chipBorder: '#8E8E93',
      chipFill: '#D1D1D6',
    },
  },
  {
    id: 'signature-metallic',
    name: 'Prestige',
    category: 'Signature',
    description: 'Brushed dual-tone platinum and gunmetal finish.',
    patternType: 'signature-metallic',
    palette: {
      gradient: ['#63636B', '#494950', '#323237'],
      borderColor: 'rgba(255, 255, 255, 0.35)',
      textColor: '#FFFFFF',
      subtextColor: '#E4E4E7',
      chevronColor: '#F4F4F5',
      chipBorder: '#FFFFFF',
      chipFill: '#3F3F46',
    },
  },
  {
    id: 'signature-linework',
    name: 'Guilloché',
    category: 'Signature',
    description: 'Intricate geometric currency security linework.',
    patternType: 'signature-linework',
    palette: {
      gradient: ['#1F2E36', '#142026', '#0C1318'],
      borderColor: 'rgba(45, 212, 191, 0.44)',
      textColor: '#FFFFFF',
      subtextColor: '#99F6E4',
      chevronColor: '#2DD4BF',
      chipBorder: '#5EEAD4',
      chipFill: '#042F2E',
    },
  },
  {
    id: 'signature-layered',
    name: 'Masterwork',
    category: 'Signature',
    description: 'Sophisticated multi-layered stepped borders.',
    patternType: 'signature-layered',
    palette: {
      gradient: ['#282633', '#1A1822', '#100F15'],
      borderColor: 'rgba(168, 85, 247, 0.42)',
      textColor: '#FFFFFF',
      subtextColor: '#E9D5FF',
      chevronColor: '#C084FC',
      chipBorder: '#DDD6FE',
      chipFill: '#3B0764',
    },
  },
];

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'Classic',
    title: 'Classic',
    description: 'The foundation of Recover. Brushed metallics, deep slate, and timeless industrial restraint.',
    cards: CARD_DESIGNS.filter((c) => c.category === 'Classic'),
  },
  {
    id: 'Weave',
    title: 'Weave',
    description: 'Tight weave, colour on colour. Every thread pulling in the same direction.',
    cards: CARD_DESIGNS.filter((c) => c.category === 'Weave'),
  },
  {
    id: 'Urban',
    title: 'Urban',
    description: "Nobody asked permission to paint it. You don't need any to reclaim your time.",
    cards: CARD_DESIGNS.filter((c) => c.category === 'Urban'),
  },
  {
    id: 'Carbon',
    title: 'Carbon',
    description: 'Aerospace-grade weaves and graphite finishes. Lightweight strength for daily focus.',
    cards: CARD_DESIGNS.filter((c) => c.category === 'Carbon'),
  },
  {
    id: 'Contour',
    title: 'Contour',
    description: 'Topographic elevation lines and relief engravings carved into metallic surfaces.',
    cards: CARD_DESIGNS.filter((c) => c.category === 'Contour'),
  },
  {
    id: 'Prism',
    title: 'Prism',
    description: 'Refractive angles, faceted planes, and sharp geometric panels catching ambient light.',
    cards: CARD_DESIGNS.filter((c) => c.category === 'Prism'),
  },
  {
    id: 'Circuit',
    title: 'Circuit',
    description: 'High-density conductive paths, micro-logic buses, and engineered schematic layouts.',
    cards: CARD_DESIGNS.filter((c) => c.category === 'Circuit'),
  },
  {
    id: 'Signature',
    title: 'Signature',
    description: 'Guilloché security engravings, fine pinstripes, and commemorative bespoke borders.',
    cards: CARD_DESIGNS.filter((c) => c.category === 'Signature'),
  },
];

export function getCardDesign(id?: string): CardDesign {
  const defaultDesign =
    CARD_DESIGNS.find((c) => c.id === 'classic-titanium') || CARD_DESIGNS[0];
  if (!id) return defaultDesign;
  if (id === 'classic-obsidian') {
    return CARD_DESIGNS.find((c) => c.id === 'classic-obsidian-black') || defaultDesign;
  }
  const found = CARD_DESIGNS.find((c) => c.id === id);
  return found || defaultDesign;
}
