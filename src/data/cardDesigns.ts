export type CardCategory =
  | 'All'
  | 'Classic';

export type PatternType =
  | 'brushed-steel'
  | 'classic-titanium'
  | 'classic-obsidian-black'
  | 'classic-arctic-silver'
  | 'classic-gold'
  | 'classic-rose-gold'
  | 'classic-lavender'
  // Backward-compatibility aliases
  | 'matte-black'
  | 'brushed-platinum'
  | 'satin-gold'
  | 'metallic-rosegold'
  | 'metallic-lilac'
  | 'wood-grain'
  | 'satin-blush'
  | 'metallic-navy'
  | 'satin-ivory'
  | 'metallic-sage'
  | 'matte-olive'
  | 'metallic-skyblue'
  | 'metallic-burgundy'
  | 'metallic-bronze'
  | 'kraft-paper'
  | 'black-marble'
  | 'white-marble';

export interface CardDesign {
  id: string;
  cardNumber: number;
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
    logoColor?: 'white' | 'black' | string;
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

export const DEFAULT_CARD_ID = 'card-3-titanium';

// ===========================================================================
// EXACT 17 RECOVER CARDS (Cards 1 to 17)
// ALL using the signature Brushed Steel finish with exact sampled color variants!
// Card #3 (Brushed Steel / Titanium) is the DEFAULT card for every free user.
// Pro users can select and apply any of the 17 cards from the gallery.
// ===========================================================================
export const CARD_DESIGNS: CardDesign[] = [
  // 1. Natural Wood (Warm Beechwood Brushed Steel)
  {
    id: 'card-1-wood',
    cardNumber: 1,
    name: 'Natural Wood',
    category: 'All',
    description: 'Warm beechwood hue with fine horizontal brushed metallic grain.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#F4D2A4', '#E3B984', '#CE9D68'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(160, 115, 65, 0.42)',
      textColor: '#1E1408',
      subtextColor: '#56381C',
      logoColor: 'black',
      chevronColor: '#6B4828',
      chipBorder: '#B8A080',
      chipFill: '#F2E2CF',
      highlightColor: 'rgba(255, 255, 255, 0.55)',
    },
  },

  // 2. Obsidian Black (Deep Matte Black Brushed Steel)
  {
    id: 'card-2-black',
    cardNumber: 2,
    name: 'Obsidian Black',
    category: 'All',
    description: 'Pure deep obsidian black with brushed metallic micro-grooves.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#1E1E22', '#141416', '#090A0C'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.95, y: 1 },
      borderColor: 'rgba(255, 255, 255, 0.22)',
      textColor: '#FFFFFF',
      subtextColor: '#A1A1A6',
      logoColor: 'white',
      chevronColor: '#C4C4C8',
      chipBorder: '#E5E5EA',
      chipFill: '#2C2C2E',
      highlightColor: 'rgba(255, 255, 255, 0.12)',
    },
  },

  // 3. Brushed Steel (Titanium) — DEFAULT FOR EVERY FREE USER
  {
    id: 'card-3-titanium',
    cardNumber: 3,
    name: 'Brushed Steel',
    category: 'All',
    description: 'Classic precision-milled titanium steel with horizontal micro-grain line texture.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#56565B', '#414146', '#2F2F34'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(255, 255, 255, 0.28)',
      textColor: '#FFFFFF',
      subtextColor: '#D1D1D6',
      logoColor: 'white',
      chevronColor: '#E5E5EA',
      chipBorder: '#FFFFFF',
      chipFill: '#5C5C62',
      highlightColor: 'rgba(255, 255, 255, 0.24)',
    },
  },

  // 4. Champagne Gold
  {
    id: 'card-4-gold',
    cardNumber: 4,
    name: 'Champagne Gold',
    category: 'All',
    description: 'Warm brushed satin champagne gold with luminous micro-grain reflections.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#DFD2BA', '#C8B693', '#AE9A72'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(155, 120, 70, 0.42)',
      textColor: '#241B0E',
      subtextColor: '#5E4A2A',
      logoColor: 'black',
      chevronColor: '#6B5430',
      chipBorder: '#BFA075',
      chipFill: '#EADBCA',
      highlightColor: 'rgba(255, 255, 255, 0.5)',
    },
  },

  // 5. Rose Gold
  {
    id: 'card-5-rosegold',
    cardNumber: 5,
    name: 'Rose Gold',
    category: 'All',
    description: 'Delicate metallic rose gold with soft pink champagne brushed luster.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#E6C2C5', '#D29FA3', '#B4787E'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(175, 100, 110, 0.42)',
      textColor: '#2E1519',
      subtextColor: '#68373E',
      logoColor: 'black',
      chevronColor: '#784048',
      chipBorder: '#C9949A',
      chipFill: '#F0D5D7',
      highlightColor: 'rgba(255, 255, 255, 0.52)',
    },
  },

  // 6. Metallic Lilac
  {
    id: 'card-6-lilac',
    cardNumber: 6,
    name: 'Metallic Lilac',
    category: 'All',
    description: 'Soft lavender violet metallic with delicate brushed steel finish.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#DCD7EC', '#C2B8DE', '#A194C9'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(135, 120, 180, 0.42)',
      textColor: '#201636',
      subtextColor: '#57487A',
      logoColor: 'black',
      chevronColor: '#65548E',
      chipBorder: '#AEA0D0',
      chipFill: '#EAE5F5',
      highlightColor: 'rgba(255, 255, 255, 0.55)',
    },
  },

  // 7. Coral Blush
  {
    id: 'card-7-blush',
    cardNumber: 7,
    name: 'Coral Blush',
    category: 'All',
    description: 'Luminous coral pink blush with fine horizontal steel grooves.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#F7C4C8', '#EFA5AA', '#D8848A'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(185, 105, 115, 0.42)',
      textColor: '#321216',
      subtextColor: '#6E343A',
      logoColor: 'black',
      chevronColor: '#7B3C42',
      chipBorder: '#CFA1A6',
      chipFill: '#F6D9DC',
      highlightColor: 'rgba(255, 255, 255, 0.52)',
    },
  },

  // 8. Sapphire Navy
  {
    id: 'card-8-navy',
    cardNumber: 8,
    name: 'Sapphire Navy',
    category: 'All',
    description: 'Deep royal sapphire navy with dark anodized brushed steel texture.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#0F3B72', '#0A2D58', '#051833'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(255, 255, 255, 0.25)',
      textColor: '#FFFFFF',
      subtextColor: '#A7C4E8',
      logoColor: 'white',
      chevronColor: '#B6D1F2',
      chipBorder: '#98BDE6',
      chipFill: '#183359',
      highlightColor: 'rgba(255, 255, 255, 0.22)',
    },
  },

  // 9. Pearl Ivory
  {
    id: 'card-9-ivory',
    cardNumber: 9,
    name: 'Pearl Ivory',
    category: 'All',
    description: 'Lustrous warm pearl ivory with brushed satin metallic sheen.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#FAF7F3', '#ECE4DC', '#DED3C7'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(170, 160, 145, 0.42)',
      textColor: '#231F19',
      subtextColor: '#5C5346',
      logoColor: 'black',
      chevronColor: '#6B6153',
      chipBorder: '#C9C1B5',
      chipFill: '#F3EFE9',
      highlightColor: 'rgba(255, 255, 255, 0.65)',
    },
  },

  // 10. Sage Green
  {
    id: 'card-10-sage',
    cardNumber: 10,
    name: 'Sage Green',
    category: 'All',
    description: 'Calming eucalyptus sage green with brushed steel metallic grain.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#A6BEAB', '#8DA292', '#708474'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(115, 135, 120, 0.42)',
      textColor: '#18221A',
      subtextColor: '#465649',
      logoColor: 'white',
      chevronColor: '#536556',
      chipBorder: '#9AB0A0',
      chipFill: '#E3ECE5',
      highlightColor: 'rgba(255, 255, 255, 0.52)',
    },
  },

  // 11. Forest Olive
  {
    id: 'card-11-olive',
    cardNumber: 11,
    name: 'Forest Olive',
    category: 'All',
    description: 'Dark tactical olive green with fine horizontal steel grooves.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#4C553B', '#39402B', '#222719'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(255, 255, 255, 0.22)',
      textColor: '#FFFFFF',
      subtextColor: '#C4CBB4',
      logoColor: 'white',
      chevronColor: '#D0D6C3',
      chipBorder: '#A2AE8B',
      chipFill: '#353B28',
      highlightColor: 'rgba(255, 255, 255, 0.18)',
    },
  },

  // 12. Brushed Platinum
  {
    id: 'card-12-silver',
    cardNumber: 12,
    name: 'Brushed Platinum',
    category: 'All',
    description: 'High-polish platinum silver with bright brushed metallic luster.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#F4F6F9', '#DEE2E8', '#C3C9D2'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.85, y: 1 },
      borderColor: 'rgba(0, 0, 0, 0.22)',
      textColor: '#16191E',
      subtextColor: '#4D5460',
      logoColor: 'black',
      chevronColor: '#565D6A',
      chipBorder: '#99A1AF',
      chipFill: '#D6DBE4',
      highlightColor: 'rgba(255, 255, 255, 0.75)',
    },
  },

  // 13. Ice Sky Blue
  {
    id: 'card-13-skyblue',
    cardNumber: 13,
    name: 'Ice Sky Blue',
    category: 'All',
    description: 'Crisp glacial sky blue with fine brushed aluminum grain.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#B9DCFA', '#98C7EF', '#6EAADC'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(90, 145, 195, 0.42)',
      textColor: '#0D2237',
      subtextColor: '#335575',
      logoColor: 'black',
      chevronColor: '#3F658A',
      chipBorder: '#8FBAE2',
      chipFill: '#E1EFFC',
      highlightColor: 'rgba(255, 255, 255, 0.65)',
    },
  },

  // 14. Cabernet Burgundy
  {
    id: 'card-14-burgundy',
    cardNumber: 14,
    name: 'Cabernet Burgundy',
    category: 'All',
    description: 'Deep velvet cabernet burgundy with dark metallic brushed finish.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#5D2330', '#471A24', '#2A0E15'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(255, 255, 255, 0.22)',
      textColor: '#FFFFFF',
      subtextColor: '#DDB4BC',
      logoColor: 'white',
      chevronColor: '#ECC1C9',
      chipBorder: '#BA7C88',
      chipFill: '#3D151E',
      highlightColor: 'rgba(255, 255, 255, 0.18)',
    },
  },

  // 15. Mocha Bronze
  {
    id: 'card-15-bronze',
    cardNumber: 15,
    name: 'Mocha Bronze',
    category: 'All',
    description: 'Warm roasted bronze umber with brushed satin metal luster.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#805E44', '#664A34', '#483323'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(255, 255, 255, 0.22)',
      textColor: '#FFFFFF',
      subtextColor: '#DDCBBB',
      logoColor: 'white',
      chevronColor: '#E8D7C8',
      chipBorder: '#BA9C82',
      chipFill: '#513A28',
      highlightColor: 'rgba(255, 255, 255, 0.18)',
    },
  },

  // 16. Recycled Kraft
  {
    id: 'card-16-sandstone',
    cardNumber: 16,
    name: 'Recycled Kraft',
    category: 'All',
    description: 'Warm desert sandstone and kraft tone with brushed steel grain.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#EEDCC5', '#DEC09F', '#CBAA85'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.9, y: 1 },
      borderColor: 'rgba(165, 125, 85, 0.42)',
      textColor: '#281D11',
      subtextColor: '#5D4730',
      logoColor: 'black',
      chevronColor: '#6D5339',
      chipBorder: '#BFA382',
      chipFill: '#EFE4D6',
      highlightColor: 'rgba(255, 255, 255, 0.55)',
    },
  },

  // 17. Gunmetal Steel
  {
    id: 'card-17-gunmetal',
    cardNumber: 17,
    name: 'Gunmetal Steel',
    category: 'All',
    description: 'Heavy gunmetal industrial steel with precision horizontal micro-grooves.',
    patternType: 'brushed-steel',
    palette: {
      gradient: ['#2E2F33', '#1F2023', '#111214'],
      gradientStart: { x: 0, y: 0 },
      gradientEnd: { x: 0.95, y: 1 },
      borderColor: 'rgba(255, 255, 255, 0.24)',
      textColor: '#FFFFFF',
      subtextColor: '#B2B4BB',
      logoColor: 'white',
      chevronColor: '#C4C6CD',
      chipBorder: '#C6C8D0',
      chipFill: '#2B2C30',
      highlightColor: 'rgba(255, 255, 255, 0.20)',
    },
  },
];

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'All',
    title: '17 Brushed Steel Editions',
    description: 'Select your signature Recover Wallet card skin.',
    cards: CARD_DESIGNS,
  },
  {
    id: 'Classic',
    title: 'Featured Collection',
    description: 'Primary metallic finishes.',
    cards: CARD_DESIGNS.slice(0, 6),
  },
];

export function getCardDesign(id?: string): CardDesign {
  // Default is Card #3 (Brushed Steel / Titanium)
  const defaultDesign = CARD_DESIGNS[2]; // Card 3
  if (!id) return defaultDesign;

  // Backward compatibility mappings
  if (id === 'card-3-titanium' || id === 'classic-titanium' || id === 'titanium') {
    return CARD_DESIGNS[2];
  }
  if (id === 'card-2-black' || id === 'classic-obsidian-black' || id === 'classic-obsidian') {
    return CARD_DESIGNS[1];
  }
  if (id === 'card-1-wood') {
    return CARD_DESIGNS[0];
  }
  if (id === 'card-4-gold' || id === 'classic-gold') {
    return CARD_DESIGNS[3];
  }
  if (id === 'card-5-rosegold' || id === 'classic-rose-gold') {
    return CARD_DESIGNS[4];
  }
  if (id === 'card-6-lilac' || id === 'classic-lavender') {
    return CARD_DESIGNS[5];
  }
  if (id === 'card-7-blush') {
    return CARD_DESIGNS[6];
  }
  if (id === 'card-8-navy') {
    return CARD_DESIGNS[7];
  }
  if (id === 'card-9-ivory') {
    return CARD_DESIGNS[8];
  }
  if (id === 'card-10-sage') {
    return CARD_DESIGNS[9];
  }
  if (id === 'card-11-olive') {
    return CARD_DESIGNS[10];
  }
  if (id === 'card-12-silver' || id === 'classic-arctic-silver') {
    return CARD_DESIGNS[11];
  }
  if (id === 'card-13-skyblue') {
    return CARD_DESIGNS[12];
  }
  if (id === 'card-14-burgundy') {
    return CARD_DESIGNS[13];
  }
  if (id === 'card-15-bronze') {
    return CARD_DESIGNS[14];
  }
  if (id === 'card-16-sandstone') {
    return CARD_DESIGNS[15];
  }
  if (id === 'card-17-gunmetal' || id === 'card-17-blackmarble') {
    return CARD_DESIGNS[16];
  }

  const found = CARD_DESIGNS.find((c) => c.id === id);
  return found || defaultDesign;
}
