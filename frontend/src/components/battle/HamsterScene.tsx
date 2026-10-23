import { useId } from 'react';
import type { SceneParts } from './scene';

const ORANGE = '#FF9F43';
const BELLY = '#FFE1D8';
const INK = '#1B2140';

function Cafeteria() {
  const tiles = [];
  for (let y = 64; y < 100; y += 9) {
    for (let x = 0; x < 160; x += 10) {
      const dark = ((x / 10 + (y - 64) / 9) | 0) % 2 === 0;
      tiles.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="10"
          height="9"
          fill={dark ? '#DDE3F5' : '#FFFFFF'}
        />,
      );
    }
  }
  return (
    <g>
      <rect width="160" height="64" fill="#FFF1EC" />
      <rect y="56" width="160" height="8" fill="#FF7A59" />
      <rect x="8" y="8" width="32" height="28" fill={INK} />
      <rect x="11" y="11" width="12" height="10" fill="#E3E9FF" />
      <rect x="25" y="11" width="12" height="10" fill="#E3E9FF" />
      <rect x="11" y="23" width="12" height="10" fill="#E3E9FF" />
      <rect x="25" y="23" width="12" height="10" fill="#E3E9FF" />
      {tiles}
    </g>
  );
}

/** What Pip guesses when nobody says where: a random sunny field. */
function Field() {
  return (
    <g>
      <rect width="160" height="64" fill="#E3E9FF" />
      <rect x="16" y="8" width="16" height="16" fill="#FFC93C" />
      <rect x="20" y="4" width="8" height="24" fill="#FFC93C" />
      <rect x="12" y="12" width="24" height="8" fill="#FFC93C" />
      <rect y="64" width="160" height="36" fill="#2FBF71" />
      <rect x="12" y="72" width="4" height="4" fill="#1F9A58" />
      <rect x="132" y="80" width="4" height="4" fill="#1F9A58" />
      <rect x="104" y="92" width="4" height="4" fill="#1F9A58" />
      <rect x="24" y="90" width="4" height="4" fill="#1F9A58" />
    </g>
  );
}

function Chalkboard({ text }: { text: boolean }) {
  return (
    <g>
      <rect x="104" y="6" width="50" height="34" fill="#FFC93C" />
      <rect x="107" y="9" width="44" height="28" fill={INK} />
      <g
        fill="#FFFFFF"
        fontFamily="ui-monospace, Menlo, monospace"
        fontWeight="700"
        fontSize="8"
        textAnchor="middle"
      >
        {text ? (
          <>
            <text x="129" y="21">
              PIZZA
            </text>
            <text x="129" y="32">
              FRIDAY
            </text>
          </>
        ) : (
          <text x="129" y="26">
            ???
          </text>
        )}
      </g>
    </g>
  );
}

function Hamster({ real, hat }: { real: boolean; hat: boolean }) {
  // Without "hamster" in the prompt, Pip draws a mystery gray blob instead.
  const fur = real ? ORANGE : '#AEB6D6';
  return (
    <g>
      {real && (
        <>
          <rect x="38" y="52" width="10" height="10" fill={fur} />
          <rect x="41" y="55" width="4" height="4" fill={BELLY} />
          <rect x="68" y="52" width="10" height="10" fill={fur} />
          <rect x="71" y="55" width="4" height="4" fill={BELLY} />
        </>
      )}
      <rect x="44" y="56" width="28" height="36" fill={fur} />
      <rect x="40" y="60" width="36" height="28" fill={fur} />
      {real && <rect x="48" y="74" width="20" height="14" fill={BELLY} />}
      <rect x="48" y="64" width="4" height="4" fill={INK} />
      <rect x="64" y="64" width="4" height="4" fill={INK} />
      <rect x="56" y="68" width="4" height="3" fill="#FF7A59" />
      {real && (
        <>
          <rect x="43" y="70" width="4" height="3" fill="#FF7A59" />
          <rect x="69" y="70" width="4" height="3" fill="#FF7A59" />
        </>
      )}
      <rect x="44" y="92" width="8" height="4" fill="#FF7A59" />
      <rect x="64" y="92" width="8" height="4" fill="#FF7A59" />
      <rect x="76" y="72" width="8" height="4" fill={fur} />
      {hat && (
        <g>
          <rect x="46" y="50" width="24" height="9" fill={INK} />
          <rect x="48" y="52" width="20" height="5" fill="#FFFFFF" />
          <rect x="42" y="36" width="32" height="16" fill={INK} />
          <rect x="44" y="38" width="28" height="12" fill="#FFFFFF" />
          <rect x="47" y="32" width="22" height="6" fill={INK} />
          <rect x="49" y="34" width="18" height="4" fill="#FFFFFF" />
        </g>
      )}
    </g>
  );
}

function Pancake({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="22" height="4" fill="#FFC93C" />
      <rect x={x} y={y + 4} width="22" height="3" fill="#F08A2C" />
    </g>
  );
}

function Cooking({ pancake, flipping }: { pancake: boolean; flipping: boolean }) {
  if (flipping) {
    return (
      <g>
        <rect x="84" y="68" width="4" height="4" fill={INK} />
        <rect x="88" y="64" width="4" height="4" fill={INK} />
        <rect x="92" y="60" width="4" height="4" fill={INK} />
        <rect x="90" y="54" width="16" height="6" fill="#AEB6D6" />
        {pancake && <Pancake x={78} y={34} />}
        <rect x="74" y="38" width="2" height="8" fill={INK} />
        <rect x="102" y="38" width="2" height="8" fill={INK} />
      </g>
    );
  }
  if (pancake) {
    // A pancake that just sits on a plate: Pip didn't know it should be flipping.
    return (
      <g>
        <rect x="92" y="86" width="30" height="4" fill="#FFFFFF" />
        <rect x="92" y="90" width="30" height="2" fill={INK} />
        <Pancake x={96} y={79} />
      </g>
    );
  }
  return null;
}

export function HamsterScene({ parts, label }: { parts: SceneParts; label: string }) {
  const blurId = `blur${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg
      viewBox="0 0 160 100"
      role="img"
      aria-label={label}
      shapeRendering={parts.pixel ? 'crispEdges' : 'auto'}
      className="block h-auto w-full rounded-[18px] border-[2.5px] border-ink bg-white"
    >
      {!parts.pixel && (
        <defs>
          <filter id={blurId}>
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
      )}
      <g filter={parts.pixel ? undefined : `url(#${blurId})`}>
        {parts.cafeteria ? <Cafeteria /> : <Field />}
        {parts.board && <Chalkboard text={parts.boardText} />}
        <Hamster real={parts.hamster} hat={parts.hat} />
        <Cooking pancake={parts.pancake} flipping={parts.flipping} />
      </g>
    </svg>
  );
}
