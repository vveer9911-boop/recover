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

  const renderContent = () => {
    switch (patternType) {
      // ---------------------------------------------------------------------
      // 1. NATURAL WOOD
      // ---------------------------------------------------------------------
      case 'wood-grain': {
        const grain1 = 'rgba(145, 95, 45, 0.16)';
        const grain2 = 'rgba(185, 135, 75, 0.22)';
        const highlight = 'rgba(255, 255, 255, 0.22)';
        return (
          <G>
            <Path
              d={isPortrait
                ? "M0 25 Q35 35 70 20 T120 30"
                : "M0 32 Q70 45 140 28 T280 40"}
              stroke={grain1}
              strokeWidth={1.8}
              fill="none"
            />
            <Path
              d={isPortrait
                ? "M0 55 Q40 45 80 60 T120 50"
                : "M0 68 Q80 54 160 76 T280 62"}
              stroke={grain2}
              strokeWidth={1.4}
              fill="none"
            />
            <Path
              d={isPortrait
                ? "M0 90 Q30 110 75 88 T120 102"
                : "M0 108 Q65 130 155 98 T280 116"}
              stroke={grain1}
              strokeWidth={2.0}
              fill="none"
            />
            <Path
              d={isPortrait
                ? "M0 125 Q45 115 85 135 T120 120"
                : "M0 144 Q95 130 185 152 T280 138"}
              stroke={grain2}
              strokeWidth={1.5}
              fill="none"
            />
            <Path
              d={isPortrait
                ? "M0 160 Q35 150 70 168 T120 155"
                : "M0 80 Q90 92 180 72 T280 88"}
              stroke={highlight}
              strokeWidth={1.0}
              fill="none"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 2. OBSIDIAN BLACK
      // ---------------------------------------------------------------------
      case 'matte-black':
      case 'classic-obsidian-black': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={0.8}
              fill="none"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // BRUSHED STEEL / TITANIUM (Signature brushed grain for all cards)
      // ---------------------------------------------------------------------
      case 'brushed-steel':
      case 'classic-titanium': {
        const lines = isPortrait
          ? [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160, 168, 176]
          : [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160, 168];
        const isDark = palette.textColor === '#FFFFFF';
        const strokeLight = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.32)';
        const strokeDark = isDark ? 'rgba(0, 0, 0, 0.22)' : 'rgba(0, 0, 0, 0.07)';
        return (
          <G>
            {lines.map((y, idx) => (
              <React.Fragment key={y}>
                <Line
                  x1={0}
                  y1={y}
                  x2={W}
                  y2={y}
                  stroke={idx % 2 === 0 ? strokeLight : strokeDark}
                  strokeWidth={0.75}
                />
              </React.Fragment>
            ))}
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 4. CHAMPAGNE GOLD
      // ---------------------------------------------------------------------
      case 'satin-gold':
      case 'classic-gold': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth={0.8}
              fill="none"
            />
            <Path
              d={isPortrait ? "M0 0 L120 186" : "M0 0 L280 176"}
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth={30}
              strokeLinecap="round"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 5. ROSE GOLD
      // ---------------------------------------------------------------------
      case 'metallic-rosegold':
      case 'classic-rose-gold': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.28)"
              strokeWidth={0.8}
              fill="none"
            />
            <Path
              d={isPortrait ? "M20 0 L140 160" : "M40 0 L280 140"}
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth={24}
              strokeLinecap="round"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 6. METALLIC LILAC
      // ---------------------------------------------------------------------
      case 'metallic-lilac':
      case 'classic-lavender': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={0.8}
              fill="none"
            />
            <Path
              d={isPortrait ? "M0 40 L120 160" : "M0 40 L280 160"}
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth={20}
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 7. CORAL BLUSH
      // ---------------------------------------------------------------------
      case 'satin-blush': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.26)"
              strokeWidth={0.8}
              fill="none"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 8. SAPPHIRE NAVY
      // ---------------------------------------------------------------------
      case 'metallic-navy': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(140, 190, 255, 0.22)"
              strokeWidth={0.8}
              fill="none"
            />
            <Path
              d={isPortrait ? "M-10 20 L130 160" : "M-20 30 L290 150"}
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth={28}
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 9. PEARL IVORY
      // ---------------------------------------------------------------------
      case 'satin-ivory': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.55)"
              strokeWidth={0.9}
              fill="none"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 10. SAGE GREEN
      // ---------------------------------------------------------------------
      case 'metallic-sage': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.28)"
              strokeWidth={0.8}
              fill="none"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 11. FOREST OLIVE
      // ---------------------------------------------------------------------
      case 'matte-olive': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth={0.8}
              fill="none"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 12. BRUSHED PLATINUM
      // ---------------------------------------------------------------------
      case 'brushed-platinum':
      case 'classic-arctic-silver': {
        const lines = isPortrait
          ? [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165]
          : [14, 28, 42, 56, 70, 84, 98, 112, 126, 140, 154, 168];
        return (
          <G>
            {lines.map((y, idx) => (
              <Line
                key={y}
                x1={0}
                y1={y}
                x2={W}
                y2={y}
                stroke={idx % 2 === 0 ? "rgba(255, 255, 255, 0.28)" : "rgba(160, 170, 185, 0.22)"}
                strokeWidth={0.7}
              />
            ))}
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 13. ICE SKY BLUE
      // ---------------------------------------------------------------------
      case 'metallic-skyblue': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth={0.8}
              fill="none"
            />
            <Path
              d={isPortrait ? "M0 10 L120 150" : "M0 10 L280 150"}
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth={24}
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 14. CABERNET BURGUNDY
      // ---------------------------------------------------------------------
      case 'metallic-burgundy': {
        const inset = isPortrait ? 6 : 9;
        return (
          <G>
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth={0.8}
              fill="none"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 15. MOCHA BRONZE
      // ---------------------------------------------------------------------
      case 'metallic-bronze': {
        const inset = isPortrait ? 6 : 9;
        const lines = isPortrait
          ? [20, 45, 70, 95, 120, 145, 170]
          : [20, 45, 70, 95, 120, 145, 170];
        return (
          <G>
            {lines.map((y) => (
              <Line
                key={y}
                x1={0}
                y1={y}
                x2={W}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={0.8}
              />
            ))}
            <Rect
              x={inset}
              y={inset}
              width={W - inset * 2}
              height={H - inset * 2}
              rx={isPortrait ? 10 : 14}
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth={0.8}
              fill="none"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 16. RECYCLED KRAFT PAPER
      // ---------------------------------------------------------------------
      case 'kraft-paper': {
        const flecks = isPortrait
          ? [
              { x: 18, y: 35, r: 1.0 },
              { x: 45, y: 72, r: 1.4 },
              { x: 92, y: 48, r: 1.1 },
              { x: 30, y: 125, r: 1.2 },
              { x: 80, y: 140, r: 1.3 },
            ]
          : [
              { x: 35, y: 38, r: 1.2 },
              { x: 85, y: 78, r: 1.5 },
              { x: 140, y: 42, r: 1.1 },
              { x: 195, y: 110, r: 1.4 },
              { x: 235, y: 65, r: 1.3 },
              { x: 70, y: 135, r: 1.2 },
              { x: 160, y: 145, r: 1.3 },
            ];
        return (
          <G>
            {flecks.map((f, i) => (
              <Circle
                key={i}
                cx={f.x}
                cy={f.y}
                r={f.r}
                fill="rgba(120, 85, 50, 0.28)"
              />
            ))}
            <Path
              d={isPortrait ? "M10 80 Q60 90 110 75" : "M20 70 Q130 95 260 65"}
              stroke="rgba(135, 95, 55, 0.16)"
              strokeWidth={1.2}
              fill="none"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 17. BLACK MARBLE (Nero Marquina with organic white veining)
      // ---------------------------------------------------------------------
      case 'black-marble': {
        const veinColor = 'rgba(255, 255, 255, 0.45)';
        const veinSoft = 'rgba(200, 215, 230, 0.22)';
        return (
          <G>
            {/* Primary organic marble vein */}
            <Path
              d={isPortrait
                ? "M15 0 C25 40, 5 70, 30 100 C50 125, 40 155, 80 186"
                : "M30 0 C60 45, 20 80, 85 110 C140 135, 175 120, 250 176"}
              stroke={veinColor}
              strokeWidth={1.4}
              fill="none"
            />
            {/* Vein branch 1 */}
            <Path
              d={isPortrait
                ? "M30 100 C55 110, 85 105, 115 120"
                : "M85 110 C130 115, 180 85, 230 95"}
              stroke={veinSoft}
              strokeWidth={0.9}
              fill="none"
            />
            {/* Vein branch 2 */}
            <Path
              d={isPortrait
                ? "M0 60 C30 55, 60 70, 90 65"
                : "M0 80 C50 70, 110 95, 170 65 C210 45, 250 55, 280 40"}
              stroke={veinSoft}
              strokeWidth={1.0}
              fill="none"
            />
            {/* Tertiary fine hairline */}
            <Path
              d={isPortrait
                ? "M40 125 C60 145, 80 140, 110 160"
                : "M140 135 C170 155, 200 145, 260 165"}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={0.6}
              fill="none"
            />
          </G>
        );
      }

      // ---------------------------------------------------------------------
      // 18. WHITE MARBLE (Carrara with smoky grey veining)
      // ---------------------------------------------------------------------
      case 'white-marble': {
        const veinColor = 'rgba(75, 80, 92, 0.35)';
        const veinSoft = 'rgba(120, 125, 138, 0.22)';
        return (
          <G>
            {/* Primary Carrara smoky vein */}
            <Path
              d={isPortrait
                ? "M10 0 C30 45, 10 75, 40 110 C65 140, 50 160, 95 186"
                : "M25 0 C55 45, 15 85, 75 115 C130 140, 185 120, 260 176"}
              stroke={veinColor}
              strokeWidth={1.5}
              fill="none"
            />
            {/* Soft branch 1 */}
            <Path
              d={isPortrait
                ? "M40 110 C65 115, 95 105, 120 125"
                : "M75 115 C120 120, 175 90, 240 100"}
              stroke={veinSoft}
              strokeWidth={1.0}
              fill="none"
            />
            {/* Soft branch 2 */}
            <Path
              d={isPortrait
                ? "M0 50 C35 45, 70 65, 105 55"
                : "M0 65 C60 55, 120 85, 180 60 C220 40, 255 50, 280 35"}
              stroke={veinSoft}
              strokeWidth={1.1}
              fill="none"
            />
            {/* Subtle hairline */}
            <Path
              d={isPortrait
                ? "M50 135 C70 150, 90 145, 115 160"
                : "M150 130 C180 150, 215 140, 275 158"}
              stroke="rgba(90, 95, 105, 0.18)"
              strokeWidth={0.7}
              fill="none"
            />
          </G>
        );
      }

      default:
        return null;
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

export default React.memo(CardPatternRendererComponent);
