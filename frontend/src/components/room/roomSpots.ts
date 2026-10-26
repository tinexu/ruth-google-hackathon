import type { ComponentType, SVGProps } from 'react';
import { ComputerIcon, DumbbellIcon, HeartIcon, QuestsIcon, SettingsIcon, TrophyIcon, ZapIcon } from '../icons';

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export type RoomPanel = 'quests' | 'checkup';

/** What tapping something in the room does: go to a page, or open a panel over the room. */
export type RoomAction = { kind: 'go'; to: string } | { kind: 'open'; panel: RoomPanel };

export interface RoomSpot {
  id: string;
  /** The thing in the picture ("Dumbbells"). */
  object: string;
  /** What it does ("Train Pip"). */
  label: string;
  action: RoomAction;
  /** Tap area in the room art's own 1200 x 760 frame. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ROOM_WIDTH = 1200;
export const ROOM_HEIGHT = 760;

export const ROOM_SPOTS: RoomSpot[] = [
  { id: 'arcade', object: 'Arcade game', label: 'Prompt Battle', action: { kind: 'go', to: '/battle' }, x: 446, y: 16, w: 136, h: 384 },
  { id: 'computer', object: 'Computer', label: 'Learn', action: { kind: 'go', to: '/feed' }, x: 56, y: 262, w: 310, h: 280 },
  { id: 'notice', object: 'Notice board', label: 'Today’s quests', action: { kind: 'open', panel: 'quests' }, x: 610, y: 42, w: 204, h: 152 },
  { id: 'trophy', object: 'Trophy shelf', label: 'Community', action: { kind: 'go', to: '/community' }, x: 838, y: 40, w: 222, h: 164 },
  { id: 'closet', object: 'Closet', label: 'Settings', action: { kind: 'go', to: '/settings' }, x: 1086, y: 92, w: 112, h: 392 },
  { id: 'dumbbell', object: 'Dumbbells', label: 'Train Pip', action: { kind: 'go', to: '/train' }, x: 904, y: 494, w: 288, h: 200 },
  { id: 'bed', object: 'Pip’s bed', label: 'Pip’s checkup', action: { kind: 'open', panel: 'checkup' }, x: 40, y: 546, w: 428, h: 212 },
];

export interface RoomTool {
  id: string;
  label: string;
  aria: string;
  icon: Icon;
  action: RoomAction;
}

/** The round buttons along the bottom: every room object, reachable without hunting. */
export const ROOM_TOOLS: RoomTool[] = [
  { id: 'learn', label: 'Learn', aria: 'Learn with Feed cards', icon: ComputerIcon, action: { kind: 'go', to: '/feed' } },
  { id: 'train', label: 'Train', aria: 'Train Pip', icon: DumbbellIcon, action: { kind: 'go', to: '/train' } },
  { id: 'battle', label: 'Battle', aria: 'Prompt Battle', icon: ZapIcon, action: { kind: 'go', to: '/battle' } },
  { id: 'quests', label: 'Quests', aria: 'Today’s quests', icon: QuestsIcon, action: { kind: 'open', panel: 'quests' } },
  { id: 'friends', label: 'Friends', aria: 'Community leaderboard', icon: TrophyIcon, action: { kind: 'go', to: '/community' } },
  { id: 'health', label: 'Health', aria: 'Pip’s checkup', icon: HeartIcon, action: { kind: 'open', panel: 'checkup' } },
  { id: 'closet', label: 'Closet', aria: 'Settings', icon: SettingsIcon, action: { kind: 'go', to: '/settings' } },
];
