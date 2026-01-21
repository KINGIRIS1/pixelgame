
import { MAP_HEIGHT, MAP_WIDTH, TileType, BiomeType } from '../constants';
import { GameMap, Entity } from '../types';
import { LEVELS, MONSTER_DB } from '../data/gameData';

// Helper: Lấy quái ngẫu nhiên
const getRandomMonsterID = (allowedList: string[]): string => {
  return allowedList[Math.floor(Math.random() * allowedList.length)];
};

export const spawnMonster = (monsterId: string, x: number, y: number): Entity => {
  const def = MONSTER_DB[monsterId] || MONSTER_DB['slime_green'];
  const variance = (Math.random() * 0.2) + 0.9; 
  return {
    id: `mob-${monsterId}-${Date.now()}-${Math.random()}`,
    type: 'monster',
    position: { x, y },
    size: def.role === 'boss' ? 64 : 32,
    health: Math.floor(def.hp * variance),
    maxHealth: Math.floor(def.hp * variance),
    name: def.name,
    damage: Math.floor(def.damage * variance),
    speed: def.speed,
    color: def.color,
    hitTimer: 0,
    role: def.role,
    xpReward: def.xp
  };
};

// --- THUẬT TOÁN KHẮC ĐƯỜNG ĐI (PATH CARVING) ---
// Đảm bảo luôn có đường từ A đến B, nếu gặp nước thì bắc cầu
const carvePath = (tiles: TileType[][], x1: number, y1: number, x2: number, y2: number, floorTile: TileType) => {
    let x = x1;
    let y = y1;
    const pathSet = new Set<string>(); // Lưu tọa độ đường đi để không spawn vật cản lên đó

    const w = MAP_WIDTH;
    const h = MAP_HEIGHT;

    // Random Walk có định hướng (Biased Random Walk)
    while (x !== x2 || y !== y2) {
        // Đánh dấu đường đi (độ rộng 2 để dễ đi)
        const makeWalkable = (cx: number, cy: number) => {
            if (cx >= 1 && cx < w - 1 && cy >= 1 && cy < h - 1) {
                // Logic bắc cầu: Nếu là Nước/Lava/Vực -> BRIDGE, ngược lại là Sàn
                const current = tiles[cy][cx];
                if (current === TileType.WATER || current === TileType.LAVA || current === TileType.SWAMP) {
                    tiles[cy][cx] = TileType.BRIDGE;
                } else if (current === TileType.WALL || current === TileType.GRASS || current === TileType.SAND || current === TileType.SNOW || current === TileType.DIRT || current === TileType.DUNGEON_FLOOR) {
                    // Nếu là tường hoặc đất thường thì gán lại floorTile (hoặc giữ nguyên nếu đã là cầu)
                    if (tiles[cy][cx] !== TileType.BRIDGE) tiles[cy][cx] = floorTile;
                }
                pathSet.add(`${cx},${cy}`);
            }
        };

        makeWalkable(x, y);
        makeWalkable(x + 1, y); // Mở rộng ngang
        makeWalkable(x, y + 1); // Mở rộng dọc

        // Di chuyển về phía đích
        const diffX = x2 - x;
        const diffY = y2 - y;

        // Random chọn trục di chuyển, ưu tiên trục xa hơn
        if (Math.abs(diffX) > Math.abs(diffY)) {
            x += Math.sign(diffX);
        } else {
            y += Math.sign(diffY);
        }

        // Thêm chút ngẫu nhiên để đường đi không quá thẳng (Drunk effect)
        if (Math.random() < 0.1) {
             const randDir = Math.floor(Math.random() * 4);
             if (randDir === 0) x++; else if (randDir === 1) x--;
             else if (randDir === 2) y++; else y--;
             // Clamp lại
             x = Math.max(1, Math.min(x, w-2));
             y = Math.max(1, Math.min(y, h-2));
        }
    }
    return pathSet;
};

export const generateMap = (levelIndex: number): GameMap => {
  const safeIndex = Math.max(0, Math.min(levelIndex, LEVELS.length - 1));
  const config = LEVELS[safeIndex];

  const tiles: TileType[][] = [];
  const entities: Entity[] = [];

  // 1. CHỌN BIOME
  let floorTile = TileType.GRASS;
  let wallTile = TileType.WALL;
  let fluidTile = TileType.WATER;
  let obstacleType: 'tree' | 'rock' = 'tree';
  
  switch(config.biome) {
    case BiomeType.SWAMP: floorTile = TileType.SWAMP; fluidTile = TileType.SWAMP; break;
    case BiomeType.DESERT: floorTile = TileType.SAND; obstacleType = 'rock'; fluidTile = TileType.WATER; break;
    case BiomeType.SNOW: floorTile = TileType.SNOW; fluidTile = TileType.ICE; break;
    case BiomeType.VOLCANO: floorTile = TileType.DIRT; obstacleType = 'rock'; fluidTile = TileType.LAVA; break; // Volcano dùng Dirt làm nền để Lava nổi bật
    case BiomeType.DUNGEON: floorTile = TileType.DUNGEON_FLOOR; wallTile = TileType.WALL; obstacleType = 'rock'; fluidTile = TileType.LAVA; break;
    default: floorTile = TileType.GRASS; fluidTile = TileType.WATER; break;
  }

  // 2. SINH ĐỊA HÌNH CƠ BẢN (NOISE / MAZE)
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
        // Viền map luôn là tường
        if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
            row.push(wallTile);
            continue;
        }

        if (config.layoutType === 'maze' || config.layoutType === 'rooms') {
            row.push(wallTile); // Mặc định lấp đầy tường cho maze
        } else {
            // Open World Noise
            // Sử dụng nhiều tầng noise để tạo sông hồ tự nhiên hơn
            const noise1 = Math.sin(x * 0.1) * Math.cos(y * 0.1);
            const noise2 = Math.sin(x * 0.3 + y * 0.2) * 0.5;
            const val = noise1 + noise2;

            if (val > 0.6) row.push(wallTile); // Núi/Đá
            else if (val < -0.6) row.push(fluidTile); // Sông/Hồ
            else row.push(floorTile); // Đất
        }
    }
    tiles.push(row);
  }

  // Logic đào Maze (nếu cần)
  if (config.layoutType === 'maze' || config.layoutType === 'rooms') {
     let diggers = config.layoutType === 'rooms' ? 4 : 6;
     for (let d=0; d<diggers; d++) {
        let cx = Math.floor(MAP_WIDTH/2);
        let cy = Math.floor(MAP_HEIGHT/2);
        let life = 700;
        while(life > 0) {
           if(cx > 1 && cx < MAP_WIDTH-2 && cy > 1 && cy < MAP_HEIGHT-2) {
              tiles[cy][cx] = floorTile;
              tiles[cy][cx+1] = floorTile; tiles[cy+1][cx] = floorTile;
           }
           const dir = Math.floor(Math.random() * 4);
           if(dir === 0) cy--; else if(dir === 1) cy++;
           else if(dir === 2) cx--; else cx++;
           life--;
        }
     }
  }

  // 3. ĐỊNH NGHĨA ĐIỂM PLAYER & ĐÍCH ĐẾN
  const startX = 4;
  const startY = Math.floor(MAP_HEIGHT / 2);
  const endX = MAP_WIDTH - 5;
  const endY = Math.floor(MAP_HEIGHT / 2);

  // 4. KHẮC ĐƯỜNG ĐI CHÍNH (CRITICAL PATH)
  // Bước này cực quan trọng: Biến tường thành đất, biến nước thành cầu.
  const criticalPath = carvePath(tiles, startX, startY, endX, endY, floorTile);

  // 5. TẠO CÂY CỐI / VẬT CẢN
  const numObstacles = config.layoutType === 'open' ? 50 : 15;
  for (let i = 0; i < numObstacles; i++) {
     const x = Math.floor(Math.random() * MAP_WIDTH);
     const y = Math.floor(Math.random() * MAP_HEIGHT);
     const key = `${x},${y}`;

     // CHỈ SPAWN NẾU:
     // 1. Là đất (không spawn dưới nước/tường)
     // 2. KHÔNG nằm trên đường đi chính (criticalPath)
     // 3. Không quá gần điểm start/end
     if (tiles[y][x] === floorTile && !criticalPath.has(key)) {
         if (Math.abs(x - startX) > 5 && Math.abs(x - endX) > 5) {
             entities.push({
                 id: `obs-${i}`,
                 type: obstacleType,
                 position: { x: x*32, y: y*32 },
                 size: 32, health: 50, maxHealth: 50,
                 isDying: false
             });
         }
     }
  }

  // 6. SPAWN QUÁI VẬT
  let monsterCount = config.density;
  // Boss
  if (config.boss) {
     monsterCount = 5; 
     // Boss luôn đứng ở cuối đường (đã được dọn dẹp)
     entities.push(spawnMonster(config.boss, endX * 32, endY * 32));
  }

  for (let i = 0; i < monsterCount; i++) {
     let mx = Math.floor(Math.random() * MAP_WIDTH);
     let my = Math.floor(Math.random() * MAP_HEIGHT);
     let attempts = 0;
     // Tìm vị trí hợp lệ (đất hoặc cầu), tránh tường/nước
     while ((tiles[my][mx] === TileType.WALL || tiles[my][mx] === TileType.WATER || tiles[my][mx] === TileType.LAVA) && attempts < 20) {
         mx = Math.floor(Math.random() * MAP_WIDTH);
         my = Math.floor(Math.random() * MAP_HEIGHT);
         attempts++;
     }
     
     if (tiles[my][mx] !== TileType.WALL) {
         if (Math.abs(mx - startX) > 8) { // Xa player chút
             const mID = getRandomMonsterID(config.monsters);
             entities.push(spawnMonster(mID, mx * 32, my * 32));
         }
     }
  }

  // 7. TẠO PORTAL / KHO BÁU (Ở Đích Đến)
  if (levelIndex < LEVELS.length - 1) {
      entities.push({
        id: 'portal-next', type: 'portal',
        position: { x: endX * 32, y: endY * 32 },
        size: 40, health: 9999, maxHealth: 9999,
        name: `Đến Level ${levelIndex + 2}`
      });
  } else {
      entities.push({
         id: 'chest-win', type: 'chest',
         position: { x: endX * 32, y: endY * 32 },
         size: 32, health: 100, maxHealth: 100, name: "KHO BÁU"
      });
  }

  return {
      levelIndex: safeIndex,
      tiles,
      entities,
      biome: config.biome,
      name: config.name,
      difficulty: safeIndex + 1
  };
};

export const getHitbox = (pos: {x: number, y: number}, size: number, type: string = 'generic') => {
  if (type === 'player' || type === 'monster') {
     const paddingX = size * 0.3; 
     const paddingY = size * 0.5; 
     return {
       x: pos.x + paddingX,
       y: pos.y + paddingY,
       w: size - (paddingX * 2),
       h: size - paddingY
     };
  } else {
    const padding = 2; 
    return {
      x: pos.x + padding,
      y: pos.y + padding,
      w: size - (padding * 2),
      h: size - (padding * 2)
    };
  }
};

export const checkCollision = (pos: {x: number, y: number}, size: number, entities: Entity[]): boolean => {
  const playerBox = getHitbox(pos, size, 'player');

  for (const ent of entities) {
    if ((ent.type === 'tree' || ent.type === 'rock' || ent.type === 'chest') && !ent.isDying) {
       const entBox = getHitbox(ent.position, ent.size, 'obstacle');
       if (
        playerBox.x < entBox.x + entBox.w &&
        playerBox.x + playerBox.w > entBox.x &&
        playerBox.y < entBox.y + entBox.h &&
        playerBox.y + playerBox.h > entBox.y
      ) {
        return true;
      }
    }
  }
  return false;
};
