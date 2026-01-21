
import { BiomeType, COLORS } from '../constants';

// --- MONSTER DATABASE ---
// Định nghĩa thông số cơ bản cho từng loại quái
export interface MonsterDef {
  id: string;
  name: string;
  role: 'melee' | 'ranged' | 'boss';
  hp: number;
  damage: number;
  speed: number;
  color: string;
  xp: number;
  spriteStyle: 'slime' | 'goblin' | 'skeleton' | 'bat' | 'golem' | 'boss_worm' | 'boss_demon';
}

export const MONSTER_DB: Record<string, MonsterDef> = {
  // Biome: Forest
  'slime_green': { id: 'slime_green', name: 'Slime', role: 'melee', hp: 40, damage: 8, speed: 1.0, color: '#7CBA58', xp: 10, spriteStyle: 'slime' },
  'rat': { id: 'rat', name: 'Chuột Rừng', role: 'melee', hp: 30, damage: 12, speed: 2.5, color: '#795548', xp: 15, spriteStyle: 'bat' }, // Re-use bat logic for small fast things
  
  // Biome: Swamp
  'slime_mud': { id: 'slime_mud', name: 'Bùn Độc', role: 'melee', hp: 60, damage: 10, speed: 0.8, color: '#5D4037', xp: 20, spriteStyle: 'slime' },
  'goblin_scout': { id: 'goblin_scout', name: 'Goblin Trinh Sát', role: 'melee', hp: 50, damage: 15, speed: 1.8, color: '#33691E', xp: 25, spriteStyle: 'goblin' },

  // Biome: Ruins
  'skeleton': { id: 'skeleton', name: 'Bộ Xương', role: 'melee', hp: 80, damage: 20, speed: 1.2, color: '#E0E0E0', xp: 35, spriteStyle: 'skeleton' },
  'bat_vampire': { id: 'bat_vampire', name: 'Dơi Hút Máu', role: 'melee', hp: 40, damage: 18, speed: 3.0, color: '#212121', xp: 30, spriteStyle: 'bat' },

  // Biome: Desert
  'scorpion': { id: 'scorpion', name: 'Bò Cạp Cát', role: 'melee', hp: 100, damage: 25, speed: 1.5, color: '#EF6C00', xp: 50, spriteStyle: 'golem' }, // Use golem generic for heavy
  'sand_worm_boss': { id: 'sand_worm_boss', name: 'Sâu Tử Thần (BOSS)', role: 'boss', hp: 1200, damage: 45, speed: 0.8, color: '#FFB74D', xp: 500, spriteStyle: 'boss_worm' },

  // Biome: Snow
  'yeti': { id: 'yeti', name: 'Người Tuyết', role: 'melee', hp: 200, damage: 30, speed: 0.8, color: '#E3F2FD', xp: 80, spriteStyle: 'golem' },
  'ice_spirit': { id: 'ice_spirit', name: 'Tinh Linh Băng', role: 'ranged', hp: 60, damage: 25, speed: 2.0, color: '#00BCD4', xp: 60, spriteStyle: 'bat' },

  // Biome: Volcano
  'fire_elemental': { id: 'fire_elemental', name: 'Lửa Quỷ', role: 'ranged', hp: 150, damage: 40, speed: 1.5, color: '#FF5722', xp: 100, spriteStyle: 'slime' },
  'magma_golem': { id: 'magma_golem', name: 'Golem Dung Nham', role: 'melee', hp: 300, damage: 60, speed: 0.5, color: '#BF360C', xp: 150, spriteStyle: 'golem' },

  // Biome: Dungeon / Shadow
  'shadow_knight': { id: 'shadow_knight', name: 'Hắc Hiệp Sĩ', role: 'melee', hp: 400, damage: 50, speed: 1.8, color: '#212121', xp: 200, spriteStyle: 'skeleton' },
  'demon_lord_boss': { id: 'demon_lord_boss', name: 'Chúa Quỷ (BOSS)', role: 'boss', hp: 3000, damage: 80, speed: 1.2, color: '#D50000', xp: 1000, spriteStyle: 'boss_demon' },
};

// --- LEVEL CONFIGURATION (10 LEVELS) ---
export interface LevelConfig {
  index: number;
  name: string;
  biome: BiomeType;
  monsters: string[]; // List of IDs from MONSTER_DB
  boss?: string;
  density: number; // Số lượng quái
  layoutType: 'open' | 'maze' | 'rooms';
}

export const LEVELS: LevelConfig[] = [
  { index: 0, name: "Cửa Rừng (Tutorial)", biome: BiomeType.FOREST, monsters: ['slime_green', 'rat'], density: 8, layoutType: 'open' },
  { index: 1, name: "Đầm Lầy Mù Sương", biome: BiomeType.SWAMP, monsters: ['slime_mud', 'rat'], density: 12, layoutType: 'open' },
  { index: 2, name: "Tàn Tích Cổ Đại", biome: BiomeType.FOREST, monsters: ['skeleton', 'bat_vampire', 'goblin_scout'], density: 15, layoutType: 'maze' },
  { index: 3, name: "Sa Mạc Khô Cằn", biome: BiomeType.DESERT, monsters: ['scorpion', 'skeleton'], density: 18, layoutType: 'open' },
  { index: 4, name: "Hang Ổ Sâu Cát", biome: BiomeType.DESERT, monsters: ['scorpion'], boss: 'sand_worm_boss', density: 5, layoutType: 'rooms' }, // BOSS 1
  { index: 5, name: "Đỉnh Núi Tuyết", biome: BiomeType.SNOW, monsters: ['yeti', 'ice_spirit'], density: 15, layoutType: 'open' },
  { index: 6, name: "Hang Động Băng", biome: BiomeType.SNOW, monsters: ['yeti', 'bat_vampire', 'skeleton'], density: 20, layoutType: 'maze' },
  { index: 7, name: "Lõi Núi Lửa", biome: BiomeType.VOLCANO, monsters: ['fire_elemental', 'magma_golem'], density: 18, layoutType: 'rooms' },
  { index: 8, name: "Ngục Tối Bóng Đêm", biome: BiomeType.DUNGEON, monsters: ['shadow_knight', 'skeleton', 'bat_vampire'], density: 25, layoutType: 'maze' },
  { index: 9, name: "Ngai Vàng Chúa Quỷ", biome: BiomeType.DUNGEON, monsters: ['shadow_knight', 'magma_golem'], boss: 'demon_lord_boss', density: 8, layoutType: 'rooms' }, // BOSS 2
];
