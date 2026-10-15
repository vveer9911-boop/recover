import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Line,
  G,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { PatternType, CardDesign } from '../data/cardDesigns';

interface CardPatternRendererProps {
  patternType: PatternType;
  palette: CardDesign['palette'];
  orientation?: 'landscape' | 'portrait';
}

function CardPatternRendererComponent({
  patternType,
  palette,
  orientation = 'landscape',
}: CardPatternRendererProps) {
  const isPortrait = orientation === 'portrait';
  const W = isPortrait ? 120 : 280;
  const H = isPortrait ? 186 : 176;

  const strokeColor = palette.highlightColor || 'rgba(255, 255, 255, 0.18)';
  const shadowStroke = 'rgba(0, 0, 0, 0.35)';
  const accent = palette.accentColor || palette.chevronColor || '#38BDF8';

  const renderContent = () => {
    switch (patternType) {
      // ---------------------------------------------------------------------
      // 1. CLASSIC COLLECTION (Exactly 6 Variants)
      // ---------------------------------------------------------------------
      case 'classic-obsidian-black': {
        const inset = isPortrait ? 6 : 9;
        const subStroke = 'rgba(255, 255, 255, 0.08)';
        return (
          <G>
            {/* Satin edge border reflection */}
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 12}
              stroke={subStroke}
              strokeWidth={0.8}
              fill="none"
            />
            {/* Precision milled hairline accents */}
            <Path
              d={isPortrait ? "M0 45 H55 L65 32 H120" : "M0 50 H128 L148 34 H280"}
              stroke="rgba(0, 0, 0, 0.6)"
              strokeWidth={2.4}
              fill="none"
            />
            <Path
              d={isPortrait ? "M0 45 H55 L65 32 H120" : "M0 50 H128 L148 34 H280"}
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth={0.8}
              fill="none"
              transform="translate(0, 0.8)"
            />
            <Path
              d={isPortrait ? "M0 115 H55 L65 128 H120" : "M0 118 H130 L150 136 H280"}
              stroke="rgba(0, 0, 0, 0.6)"
              strokeWidth={2.4}
              fill="none"
            />
            <Path
              d={isPortrait ? "M0 115 H55 L65 128 H120" : "M0 118 H130 L150 136 H280"}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={0.8}
              fill="none"
              transform="translate(0, 0.8)"
            />
            {/* Subtle matte texture circles */}
            {(!isPortrait ? [70, 130, 190, 240] : [35, 60, 85]).map((x) => (
              <Circle key={x} cx={x} cy={isPortrait ? 85 : 88} r={1.2} fill="rgba(255, 255, 255, 0.12)" />
            ))}
          </G>
        );
      }

      case 'classic-gold': {
        const inset = isPortrait ? 6 : 9;
        const goldHighlight = 'rgba(255, 255, 255, 0.55)';
        const goldShadow = 'rgba(120, 100, 65, 0.35)';
        return (
          <G>
            {/* Inset metallic border */}
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 12}
              stroke={goldHighlight}
              strokeWidth={0.7}
              fill="none"
              opacity={0.65}
            />
            {/* Satin champagne reflection curves */}
            <Path
              d={isPortrait ? "M0 38 H58 L72 24 H120" : "M0 44 H136 L158 24 H280"}
              stroke={goldHighlight}
              strokeWidth={1}
              fill="none"
              opacity={0.75}
            />
            <Path
              d={isPortrait ? "M0 120 H55 L70 136 H120" : "M0 126 H125 L146 148 H280"}
              stroke={goldShadow}
              strokeWidth={1.2}
              fill="none"
            />
            {/* Fine milled hairline pinstripes */}
            {[26, 34, 42].map((y) => (
              <Line
                key={y}
                x1={isPortrait ? 75 : 180}
                y1={isPortrait ? y + 5 : y}
                x2={W - 14}
                y2={isPortrait ? y + 5 : y}
                stroke={goldHighlight}
                strokeWidth={0.5}
                strokeDasharray="4 2"
                opacity={0.5}
              />
            ))}
          </G>
        );
      }

      case 'classic-rose-gold': {
        const inset = isPortrait ? 6 : 9;
        const roseHighlight = 'rgba(255, 255, 255, 0.5)';
        const roseShadow = 'rgba(145, 80, 95, 0.3)';
        return (
          <G>
            {/* Inset metallic frame */}
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 12}
              stroke={roseHighlight}
              strokeWidth={0.7}
              fill="none"
              opacity={0.65}
            />
            {/* Diagonal satin highlight reflection */}
            <Path
              d={isPortrait ? "M0 40 H56 L70 26 H120" : "M0 42 H130 L152 22 H280"}
              stroke={roseHighlight}
              strokeWidth={1}
              fill="none"
              opacity={0.8}
            />
            <Path
              d={isPortrait ? "M0 122 H54 L68 138 H120" : "M0 128 H124 L146 150 H280"}
              stroke={roseShadow}
              strokeWidth={1.2}
              fill="none"
            />
            {/* Precision satin luster lines */}
            {[25, 33].map((y) => (
              <Line
                key={y}
                x1={isPortrait ? 75 : 175}
                y1={isPortrait ? y + 6 : y}
                x2={W - 14}
                y2={isPortrait ? y + 6 : y}
                stroke={roseHighlight}
                strokeWidth={0.5}
                strokeDasharray="4 3"
                opacity={0.55}
              />
            ))}
          </G>
        );
      }

      case 'classic-lavender': {
        const inset = isPortrait ? 6 : 9;
        const lavenderHighlight = 'rgba(255, 255, 255, 0.6)';
        const lavenderShadow = 'rgba(110, 100, 130, 0.3)';
        return (
          <G>
            {/* Subtle inset rim */}
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 12}
              stroke={lavenderHighlight}
              strokeWidth={0.75}
              fill="none"
              opacity={0.6}
            />
            {/* Light lavender satin sheen path */}
            <Path
              d={isPortrait ? "M0 38 H60 L74 24 H120" : "M0 42 H134 L156 22 H280"}
              stroke={lavenderHighlight}
              strokeWidth={1}
              fill="none"
              opacity={0.8}
            />
            <Path
              d={isPortrait ? "M0 124 H56 L70 138 H120" : "M0 126 H128 L150 148 H280"}
              stroke={lavenderShadow}
              strokeWidth={1.2}
              fill="none"
            />
            {/* Satin hairline accents */}
            {[26, 34].map((y) => (
              <Line
                key={y}
                x1={isPortrait ? 78 : 180}
                y1={isPortrait ? y + 6 : y}
                x2={W - 14}
                y2={isPortrait ? y + 6 : y}
                stroke={lavenderHighlight}
                strokeWidth={0.5}
                strokeDasharray="3 3"
                opacity={0.55}
              />
            ))}
          </G>
        );
      }

      case 'classic-titanium': {
        if (isPortrait) {
          return (
            <G>
              <Path d="M0 45 H55 L65 30 H120" stroke={shadowStroke} strokeWidth={2.5} fill="none" />
              <Path d="M0 45 H55 L65 30 H120" stroke={strokeColor} strokeWidth={0.8} fill="none" />
              <Path d="M0 115 H55 L65 130 H120" stroke={shadowStroke} strokeWidth={2.5} fill="none" />
              <Path d="M0 115 H55 L65 130 H120" stroke={strokeColor} strokeWidth={0.8} fill="none" />
              <Path d="M0 145 H80 L90 155 H120" stroke={strokeColor} strokeWidth={0.6} fill="none" />
              <Path d="M60 50 H115 V68 H60 Z" stroke={strokeColor} strokeWidth={0.6} fill="none" />
              <Circle cx={65} cy={50} r={1} fill={strokeColor} />
              <Circle cx={110} cy={50} r={1} fill={strokeColor} />
              <Circle cx={65} cy={68} r={1} fill={strokeColor} />
              <Circle cx={110} cy={68} r={1} fill={strokeColor} />
            </G>
          );
        }
        return (
          <G>
            <Path d="M0 50 H128 L148 34 H280" stroke={shadowStroke} strokeWidth={3} fill="none" />
            <Path d="M0 50 H128 L148 34 H280" stroke={strokeColor} strokeWidth={0.8} fill="none" transform="translate(0, 1)" />
            <Path d="M0 118 H130 L150 136 H280" stroke={shadowStroke} strokeWidth={3} fill="none" />
            <Path d="M0 118 H130 L150 136 H280" stroke={strokeColor} strokeWidth={0.8} fill="none" transform="translate(0, 1)" />
            <Path d="M0 142 H190 L205 150 H280" stroke={strokeColor} strokeWidth={0.8} fill="none" />
            <Path d="M144 62 H274 V82 H144 Z" stroke={strokeColor} strokeWidth={0.8} fill="none" />
            <Path d="M144 118 H274 V136 H144 Z" stroke={strokeColor} strokeWidth={0.8} fill="none" />
            {[60, 120, 180, 240].map((x) => (
              <Circle key={x} cx={x} cy={90} r={1.2} fill={strokeColor} />
            ))}
          </G>
        );
      }

      case 'classic-arctic-silver': {
        const pStroke = 'rgba(0,0,0,0.14)';
        const pHi = 'rgba(255,255,255,0.7)';
        return (
          <G>
            <Path d={isPortrait ? "M0 35 H60 L75 20 H120" : "M0 45 H140 L160 25 H280"} stroke={pStroke} strokeWidth={2} fill="none" />
            <Path d={isPortrait ? "M0 35 H60 L75 20 H120" : "M0 45 H140 L160 25 H280"} stroke={pHi} strokeWidth={1} fill="none" transform="translate(0,1)" />
            <Path d={isPortrait ? "M0 125 H60 L75 140 H120" : "M0 120 H130 L150 140 H280"} stroke={pStroke} strokeWidth={2} fill="none" />
            <Path d={isPortrait ? "M0 125 H60 L75 140 H120" : "M0 120 H130 L150 140 H280"} stroke={pHi} strokeWidth={1} fill="none" transform="translate(0,1)" />
            {[20, 45, 70, 95].map((y) => (
              <Line key={y} x1={isPortrait ? 80 : 180} y1={y} x2={W - 10} y2={y} stroke={pStroke} strokeWidth={0.6} strokeDasharray="3 3" />
            ))}
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 2. WEAVE COLLECTION
      // ---------------------------------------------------------------------
      case 'weave-diagonal':
      case 'weave-tonal':
      case 'weave-threads': {
        const step = isPortrait ? 12 : 18;
        const count = isPortrait ? 24 : 32;
        return (
          <G opacity={0.65}>
            {Array.from({ length: count }).map((_, i) => {
              const offset = (i - 10) * step;
              return (
                <G key={i}>
                  <Line x1={offset} y1={0} x2={offset + H} y2={H} stroke={strokeColor} strokeWidth={2.4} strokeLinecap="round" />
                  <Line x1={offset + 4} y1={0} x2={offset + H + 4} y2={H} stroke={shadowStroke} strokeWidth={1.2} />
                </G>
              );
            })}
          </G>
        );
      }

      case 'weave-interlocking':
      case 'weave-tight':
      case 'weave-offset':
      case 'weave-crosshatch': {
        const step = isPortrait ? 14 : 20;
        const count = isPortrait ? 20 : 26;
        return (
          <G opacity={0.55}>
            {Array.from({ length: count }).map((_, i) => {
              const pos = (i - 6) * step;
              return (
                <G key={'d' + i}>
                  <Line x1={pos} y1={0} x2={pos + H} y2={H} stroke={strokeColor} strokeWidth={1.8} />
                  <Line x1={pos + H} y1={0} x2={pos} y2={H} stroke={strokeColor} strokeWidth={1.8} />
                </G>
              );
            })}
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 3. URBAN COLLECTION
      // ---------------------------------------------------------------------
      case 'urban-grid':
      case 'urban-geometry':
      case 'urban-rectangular': {
        const gw = isPortrait ? 20 : 28;
        const gh = isPortrait ? 22 : 24;
        return (
          <G opacity={0.45}>
            {Array.from({ length: Math.ceil(W / gw) }).map((_, i) => (
              <Line key={'vx' + i} x1={i * gw} y1={0} x2={i * gw} y2={H} stroke={strokeColor} strokeWidth={0.9} />
            ))}
            {Array.from({ length: Math.ceil(H / gh) }).map((_, i) => (
              <Line key={'hy' + i} x1={0} y1={i * gh} x2={W} y2={i * gh} stroke={strokeColor} strokeWidth={0.9} />
            ))}
            <Rect x={isPortrait ? 20 : 60} y={isPortrait ? 40 : 40} width={isPortrait ? 80 : 160} height={isPortrait ? 90 : 80} stroke={accent} strokeWidth={1.5} fill="none" opacity={0.6} />
          </G>
        );
      }

      case 'urban-silhouette': {
        return (
          <G opacity={0.6}>
            <Path
              d={isPortrait
                ? "M0 186 L0 130 H18 V105 H32 V125 H50 V95 H68 V115 H85 V85 H102 V110 H120 V186 Z"
                : "M0 176 L0 120 H35 V90 H65 V110 H105 V75 H145 V100 H185 V70 H225 V95 H280 V176 Z"}
              fill="rgba(0,0,0,0.4)"
              stroke={strokeColor}
              strokeWidth={1.2}
            />
          </G>
        );
      }

      case 'urban-concrete':
      case 'urban-steel':
      case 'urban-structural': {
        return (
          <G opacity={0.5}>
            {/* Structural trusses / beams */}
            <Path d={isPortrait ? "M10 0 L110 186" : "M20 0 L260 176"} stroke={strokeColor} strokeWidth={2.4} />
            <Path d={isPortrait ? "M110 0 L10 186" : "M260 0 L20 176"} stroke={strokeColor} strokeWidth={2.4} />
            <Path d={isPortrait ? "M0 93 H120" : "M0 88 H280"} stroke={strokeColor} strokeWidth={1.5} />
            {[20, 60, 100, 140, 180, 220].map((x) => (
              <Circle key={x} cx={isPortrait ? (x * 0.4) + 10 : x} cy={H / 2} r={isPortrait ? 1.5 : 2.5} fill={strokeColor} />
            ))}
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 4. CARBON COLLECTION
      // ---------------------------------------------------------------------
      case 'carbon-fiber':
      case 'carbon-graphite':
      case 'carbon-black':
      case 'carbon-surface':
      case 'carbon-layered':
      case 'carbon-steel':
      case 'carbon-circuitry': {
        const step = isPortrait ? 6 : 8;
        const rows = Math.ceil(H / step);
        const cols = Math.ceil(W / step);
        return (
          <G opacity={0.35}>
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((_, c) => {
                if ((r + c) % 2 === 0) {
                  return (
                    <Rect
                      key={`${r}-${c}`}
                      x={c * step}
                      y={r * step}
                      width={step}
                      height={step}
                      fill={strokeColor}
                      opacity={0.6}
                    />
                  );
                }
                return null;
              })
            )}
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 5. CONTOUR COLLECTION
      // ---------------------------------------------------------------------
      case 'contour-elevation':
      case 'contour-parallel':
      case 'contour-terrain':
      case 'contour-relief':
      case 'contour-landscapes':
      case 'contour-carved':
      case 'contour-symmetrical': {
        const lines = isPortrait
          ? [
              "M0 30 Q30 20 60 40 T120 30",
              "M0 55 Q35 45 60 70 T120 50",
              "M0 80 Q30 75 60 95 T120 75",
              "M0 105 Q40 90 60 120 T120 100",
              "M0 130 Q30 120 60 145 T120 125",
              "M0 155 Q35 145 60 170 T120 150",
            ]
          : [
              "M0 30 Q70 10 140 45 T280 30",
              "M0 55 Q80 35 140 75 T280 50",
              "M0 80 Q70 65 140 105 T280 75",
              "M0 105 Q90 85 140 130 T280 100",
              "M0 130 Q70 115 140 155 T280 125",
              "M0 155 Q80 140 140 175 T280 150",
            ];
        return (
          <G opacity={0.65}>
            {lines.map((d, i) => (
              <Path key={i} d={d} stroke={strokeColor} strokeWidth={1.3} fill="none" />
            ))}
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 6. PRISM COLLECTION
      // ---------------------------------------------------------------------
      case 'prism-panels':
      case 'prism-facets':
      case 'prism-metallic':
      case 'prism-triangular':
      case 'prism-blocking':
      case 'prism-reflective':
      case 'prism-asymmetric': {
        if (isPortrait) {
          return (
            <G opacity={0.6}>
              <Path d="M0 0 L60 90 L0 186 Z" stroke={strokeColor} strokeWidth={1} fill="none" opacity={0.5} />
              <Path d="M120 0 L60 90 L120 186 Z" stroke={strokeColor} strokeWidth={1} fill="none" opacity={0.5} />
              <Path d="M60 0 L60 186" stroke={strokeColor} strokeWidth={1.2} />
              <Path d="M0 90 H120" stroke={strokeColor} strokeWidth={1.2} />
              <Path d="M30 45 L90 135" stroke={accent} strokeWidth={1.4} opacity={0.7} />
              <Path d="M90 45 L30 135" stroke={accent} strokeWidth={1.4} opacity={0.7} />
            </G>
          );
        }
        return (
          <G opacity={0.6}>
            <Path d="M0 0 L140 88 L0 176 Z" stroke={strokeColor} strokeWidth={1} fill="none" opacity={0.5} />
            <Path d="M280 0 L140 88 L280 176 Z" stroke={strokeColor} strokeWidth={1} fill="none" opacity={0.5} />
            <Path d="M140 0 L140 176" stroke={strokeColor} strokeWidth={1.2} />
            <Path d="M0 88 H280" stroke={strokeColor} strokeWidth={1.2} />
            <Path d="M70 44 L210 132" stroke={accent} strokeWidth={1.5} opacity={0.7} />
            <Path d="M210 44 L70 132" stroke={accent} strokeWidth={1.5} opacity={0.7} />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 7. CIRCUIT COLLECTION
      // ---------------------------------------------------------------------
      case 'circuit-traces':
      case 'circuit-schematic':
      case 'circuit-pathways':
      case 'circuit-connections':
      case 'circuit-nodes':
      case 'circuit-micro':
      case 'circuit-structured': {
        if (isPortrait) {
          return (
            <G opacity={0.7}>
              <Path d="M10 20 V80 L35 105 V170" stroke={strokeColor} strokeWidth={1.4} fill="none" />
              <Path d="M110 20 V80 L85 105 V170" stroke={strokeColor} strokeWidth={1.4} fill="none" />
              <Path d="M35 50 H85" stroke={accent} strokeWidth={1.2} fill="none" />
              <Path d="M35 130 H85" stroke={accent} strokeWidth={1.2} fill="none" />
              <Circle cx={35} cy={50} r={2.5} fill={accent} />
              <Circle cx={85} cy={50} r={2.5} fill={accent} />
              <Circle cx={35} cy={130} r={2.5} fill={accent} />
              <Circle cx={85} cy={130} r={2.5} fill={accent} />
            </G>
          );
        }
        return (
          <G opacity={0.7}>
            <Path d="M20 20 H100 L125 45 H260" stroke={strokeColor} strokeWidth={1.5} fill="none" />
            <Path d="M20 156 H100 L125 131 H260" stroke={strokeColor} strokeWidth={1.5} fill="none" />
            <Path d="M60 45 V131" stroke={accent} strokeWidth={1.2} fill="none" />
            <Path d="M220 45 V131" stroke={accent} strokeWidth={1.2} fill="none" />
            <Circle cx={60} cy={45} r={3} fill={accent} />
            <Circle cx={60} cy={131} r={3} fill={accent} />
            <Circle cx={220} cy={45} r={3} fill={accent} />
            <Circle cx={220} cy={131} r={3} fill={accent} />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 8. SIGNATURE COLLECTION
      // ---------------------------------------------------------------------
      case 'signature-borders':
      case 'signature-pinstripes':
      case 'signature-corners':
      case 'signature-embossed':
      case 'signature-metallic':
      case 'signature-linework':
      case 'signature-layered':
      default: {
        const inset = isPortrait ? 8 : 12;
        const inset2 = isPortrait ? 13 : 18;
        return (
          <G opacity={0.65}>
            {/* Outer border inset */}
            <Rect x={inset} y={inset} width={W - inset * 2} height={H - inset * 2} rx={isPortrait ? 8 : 12} stroke={strokeColor} strokeWidth={1} fill="none" />
            <Rect x={inset2} y={inset2} width={W - inset2 * 2} height={H - inset2 * 2} rx={isPortrait ? 6 : 9} stroke={strokeColor} strokeWidth={0.6} strokeDasharray="3 2" fill="none" />
            {/* Corner brackets */}
            <Path d={`M${inset + 4} ${inset + 14} V${inset + 4} H${inset + 14}`} stroke={accent} strokeWidth={1.8} fill="none" />
            <Path d={`M${W - inset - 4} ${inset + 14} V${inset + 4} H${W - inset - 14}`} stroke={accent} strokeWidth={1.8} fill="none" />
            <Path d={`M${inset + 4} ${H - inset - 14} V${H - inset - 4} H${inset + 14}`} stroke={accent} strokeWidth={1.8} fill="none" />
            <Path d={`M${W - inset - 4} ${H - inset - 14} V${H - inset - 4} H${W - inset - 14}`} stroke={accent} strokeWidth={1.8} fill="none" />
          </G>
        );
      }
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {renderContent()}
      </Svg>
    </View>
  );
}

const CardPatternRenderer = React.memo(CardPatternRendererComponent);
export default CardPatternRenderer;
