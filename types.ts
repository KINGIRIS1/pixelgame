
import { TileType, BiomeType } from './constants';

export interface Position {
  x: number;
  y: number;
}

// --- CẤU TRÚC TÚI ĐỒ (BAG) ---
export interface Item {
  id: string;
  name: string;
  icon: string;
  type: 'weapon' | 'potion' | 'material';
  quantity: number;
  description?: string;
}

// --- CẤU TRÚC THỰC THỂ (ENTITY) ---
export interface Entity {
  id: string;
  type: 'player' | 'npc' | 'monster' | 'tree' | 'rock' | 'projectile' | 'portal' | 'chest';
  position: Position;
  size: number;
  health: number;
  maxHealth: number;
  name?: string;
  
  // Thuộc tính chiến đấu
  damage?: number; 
  speed?: number;
  target?: Position; 
  color?: string;
  createAt?: number; 
  
  // Monster Properties extended
  role?: string; // melee, ranged, boss
  xpReward?: number;
  
  // Animation properties
  hitTimer?: number;
  isDying?: boolean; 
  deathTimer?: number; 
  rotation?: number; 
  shakeX?: number; 
  
  // Player specific animations
  facing?: number; 
  attackTimer?: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number; 
}

// --- CẤU TRÚC BẢN ĐỒ (MAP) ---
export interface GameMap {
  levelIndex: number; // 0 -> 9
  tiles: TileType[][];
  entities: Entity[];
  biome: BiomeType;
  name: string;
  difficulty: number;
}

// --- TRẠNG THÁI GAME TỔNG QUÁT ---
export interface GameState {
  player: Entity;
  inventory: Item[];
  camera: Position;
  map: GameMap;
  projectiles: Entity[];
  floatingTexts: FloatingText[];
}

export interface GameRef {
  attack: () => void;
  skill1: () => void; 
  skill2: () => void; 
}
