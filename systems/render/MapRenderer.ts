
import { COLORS, TileType, MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from '../../constants';
import { GameMap } from '../../types';

// Hàm vẽ texture noise giả lập chi tiết đất/cỏ
const drawDetail = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, density: number) => {
    ctx.fillStyle = color;
    const seed = x * 12.9898 + y * 78.233;
    const random = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
    let s = seed;
    for(let i = 0; i < density; i++) {
        const ox = random(s) * TILE_SIZE;
        const oy = random(s + 1) * TILE_SIZE;
        ctx.fillRect(x + ox, y + oy, 2, 2);
        s += 2;
    }
};

export const drawMap = (ctx: CanvasRenderingContext2D, map: GameMap, camera: {x: number, y: number}, canvasW: number, canvasH: number, tick: number) => {
    const startCol = Math.floor(camera.x / TILE_SIZE);
    const endCol = startCol + (canvasW / TILE_SIZE) + 1;
    const startRow = Math.floor(camera.y / TILE_SIZE);
    const endRow = startRow + (canvasH / TILE_SIZE) + 2;

    for (let y = Math.max(0, startRow); y <= Math.min(MAP_HEIGHT-1, endRow); y++) {
      for (let x = Math.max(0, startCol); x <= Math.min(MAP_WIDTH-1, endCol); x++) {
          const tile = map.tiles[y][x];
          const px = x * TILE_SIZE;
          const py = y * TILE_SIZE;

          // -- XỬ LÝ CÁC LOẠI TILE CHẤT LỎNG (NƯỚC, LAVA) --
          if (tile === TileType.WATER || tile === TileType.SWAMP || tile === TileType.LAVA) {
             let surfaceColor = COLORS.WATER_SURFACE;
             let deepColor = COLORS.WATER_DEEP;
             
             if (tile === TileType.SWAMP) {
                 surfaceColor = COLORS.SWAMP_WATER;
                 deepColor = COLORS.SWAMP_MUD;
             } else if (tile === TileType.LAVA) {
                 surfaceColor = COLORS.LAVA_LIGHT;
                 deepColor = COLORS.LAVA_DARK;
             }

             // Nền
             ctx.fillStyle = deepColor;
             ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
             
             // Sóng/Hiệu ứng chuyển động
             ctx.fillStyle = surfaceColor;
             const waveOffset = Math.sin((x + y + tick * 0.05)) * (tile === TileType.LAVA ? 2 : 4);
             ctx.globalAlpha = 0.6;
             ctx.fillRect(px, py + 8 + waveOffset, TILE_SIZE, 4);
             if (tile === TileType.LAVA) {
                 if (Math.random() > 0.95) ctx.fillRect(px + Math.random()*20, py + Math.random()*20, 6, 6);
             } else {
                 ctx.fillRect(px, py + 20 - waveOffset, TILE_SIZE, 2);
             }
             ctx.globalAlpha = 1.0;

          } else if (tile === TileType.WALL) {
             // Chỉ vẽ nền chân tường
             ctx.fillStyle = COLORS.DUNGEON_WALL;
             ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          } else if (tile === TileType.BRIDGE) {
             // -- VẼ CẦU GỖ --
             // Vẽ nền nước/lava bên dưới trước (giả lập cầu bắc qua)
             const isVolcano = map.biome === 'volcano' || map.biome === 'dungeon';
             ctx.fillStyle = isVolcano ? COLORS.LAVA_DARK : COLORS.WATER_DEEP;
             ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
             
             // Vẽ ván cầu
             ctx.fillStyle = '#795548'; // Màu gỗ nâu
             ctx.fillRect(px, py + 2, TILE_SIZE, TILE_SIZE - 4);
             
             // Vẽ các khe gỗ
             ctx.fillStyle = '#3E2723'; // Gỗ đậm
             for(let i=1; i<4; i++) {
                 ctx.fillRect(px + (i*8), py + 2, 2, TILE_SIZE - 4);
             }
             // Đinh tán
             ctx.fillStyle = '#D7CCC8';
             ctx.fillRect(px + 2, py + 4, 2, 2); ctx.fillRect(px + 2, py + 26, 2, 2);

          } else {
             // -- CÁC LOẠI SÀN/ĐẤT CÒN LẠI --
             let baseColor = COLORS.DIRT;
             let detailColor = null;

             switch (tile) {
                case TileType.GRASS: 
                    baseColor = (x + y) % 2 === 0 ? COLORS.GRASS_LIGHT : COLORS.GRASS_DARK; 
                    detailColor = COLORS.GRASS_DETAIL;
                    break;
                case TileType.SNOW: 
                    baseColor = (x + y) % 2 === 0 ? COLORS.SNOW_LIGHT : COLORS.SNOW_DARK; 
                    detailColor = COLORS.SNOW_DETAIL;
                    break;
                case TileType.SAND: 
                    baseColor = (x + y) % 2 === 0 ? COLORS.SAND_LIGHT : COLORS.SAND_DARK; 
                    detailColor = COLORS.SAND_DETAIL;
                    break;
                case TileType.DUNGEON_FLOOR:
                    baseColor = (x + y) % 2 === 0 ? COLORS.DUNGEON_FLOOR : COLORS.DUNGEON_FLOOR_DARK;
                    ctx.fillStyle = baseColor;
                    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.strokeStyle = '#212121'; ctx.lineWidth = 1;
                    ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
                    continue; 
             }
             
             ctx.fillStyle = baseColor;
             ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
             if (detailColor) drawDetail(ctx, px, py, detailColor, 4);
          }
      }
    }

    // -- VẼ TƯỜNG 2.5D (LAYER TRÊN) --
    for (let y = Math.max(0, startRow); y <= Math.min(MAP_HEIGHT-1, endRow); y++) {
        for (let x = Math.max(0, startCol); x <= Math.min(MAP_WIDTH-1, endCol); x++) {
            if (map.tiles[y][x] === TileType.WALL) {
                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;
                const wallHeight = 24; 

                // Mặt trước
                ctx.fillStyle = COLORS.STONE_FACE;
                ctx.fillRect(px, py - wallHeight, TILE_SIZE, TILE_SIZE + wallHeight);
                // Mặt trên
                ctx.fillStyle = COLORS.STONE_TOP;
                ctx.fillRect(px, py - wallHeight, TILE_SIZE, TILE_SIZE);
                // Viền
                ctx.fillStyle = '#E0E0E0';
                ctx.fillRect(px, py - wallHeight, TILE_SIZE, 2); 
                // Chi tiết
                ctx.fillStyle = COLORS.STONE_DARK;
                if ((x+y)%3===0) ctx.fillRect(px + 10, py - 10, 2, 8);
            }
        }
    }
};
