
export const TILE_SIZE = 32; // Kích thước mỗi ô đất (pixel)
export const MAP_WIDTH = 50; // Chiều rộng bản đồ (số ô)
export const MAP_HEIGHT = 50; // Chiều cao bản đồ (số ô)
export const PLAYER_SPEED = 5; // Tăng tốc độ chút cho mượt

// Định nghĩa màu sắc theo phong cách Pixel Art
export const COLORS = {
  // --- BIOME: FOREST (Rừng) ---
  GRASS_LIGHT: '#7CBA58', 
  GRASS_DARK: '#6EA94D',  
  GRASS_DETAIL: '#4E8A38',
  DIRT: '#8B6E4A',        
  TREE_TRUNK: '#5D4037',  
  TREE_LEAVES: '#3E7A46', 
  TREE_LEAVES_LIGHT: '#589A62',

  // --- BIOME: SNOW (Tuyết) ---
  SNOW_LIGHT: '#E3F2FD',
  SNOW_DARK: '#BBDEFB',
  SNOW_DETAIL: '#90CAF9',
  ICE: '#90CAF9',
  PINE_LEAVES: '#263238', 
  PINE_LEAVES_LIGHT: '#37474F',

  // --- BIOME: DESERT (Sa mạc) ---
  SAND_LIGHT: '#FFF59D',
  SAND_DARK: '#FDD835',
  SAND_DETAIL: '#FBC02D',
  CACTUS: '#43A047',
  
  // --- BIOME: VOLCANO / DUNGEON (Mới) ---
  LAVA_LIGHT: '#FF5722',
  LAVA_DARK: '#BF360C',
  DUNGEON_FLOOR: '#424242',
  DUNGEON_FLOOR_DARK: '#212121',
  DUNGEON_WALL: '#616161',
  
  // --- MOUNTAIN & WALLS ---
  STONE_TOP: '#9E9E9E',
  STONE_FACE: '#757575',
  STONE_DARK: '#424242',

  // --- WATER & SWAMP ---
  WATER_SURFACE: '#29B6F6',
  WATER_DEEP: '#0288D1',
  WATER_FOAM: '#E1F5FE',
  SWAMP_WATER: '#4DB6AC',
  SWAMP_MUD: '#5D4037',

  // --- ENTITIES ---
  PLAYER_HAIR: '#1A1A1A', 
  PLAYER_SKIN: '#F5CB98', 
  PLAYER_SHIRT: '#3B3B3B',
  
  // Monsters Palette (Generic fallback)
  MONSTER_SLIME: '#4FC3F7', 
  MONSTER_GOBLIN: '#43A047', 
  MONSTER_SNOWMAN: '#ECEFF1',
  MONSTER_SCORPION: '#EF6C00',
  
  PROJECTILE: '#FFD700', 
  DAMAGE_TEXT: '#FFEB3B', 
  
  PORTAL: '#9C27B0', 
  PORTAL_INNER: '#E1BEE7'
};

// Loại ô đất
export enum TileType {
  GRASS = 0,
  DIRT = 1,
  WALL = 2,
  WATER = 3,
  SNOW = 4,
  ICE = 5,
  SAND = 6,
  // New Tiles
  LAVA = 7,
  DUNGEON_FLOOR = 8,
  SWAMP = 9,
  BRIDGE = 10
}

export enum BiomeType {
  FOREST = 'forest',
  SNOW = 'snow',
  DESERT = 'desert',
  SWAMP = 'swamp',
  VOLCANO = 'volcano',
  DUNGEON = 'dungeon'
}
