
import { COLORS, TileType, BiomeType, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from '../constants';
import { Entity, GameMap, GameState } from '../types';

/**
 * MODULE: RENDER SYSTEM
 * Nhiệm vụ: Chứa toàn bộ logic vẽ (Draw). Không chứa logic game.
 */

// --- 1. VẼ BẢN ĐỒ (MAP RENDERER) ---
export const drawMap = (ctx: CanvasRenderingContext2D, map: GameMap, camera: {x: number, y: number}, canvasW: number, canvasH: number) => {
    const startCol = Math.floor(camera.x / TILE_SIZE);
    const endCol = startCol + (canvasW / TILE_SIZE) + 1;
    const startRow = Math.floor(camera.y / TILE_SIZE);
    const endRow = startRow + (canvasH / TILE_SIZE) + 1;

    for (let y = Math.max(0, startRow); y <= Math.min(MAP_HEIGHT-1, endRow); y++) {
      for (let x = Math.max(0, startCol); x <= Math.min(MAP_WIDTH-1, endCol); x++) {
          let color = '#000';
          const tile = map.tiles[y][x];
          // Logic màu sắc tile
          switch (tile) {
            case TileType.GRASS: color = (x + y) % 2 === 0 ? COLORS.GRASS_LIGHT : COLORS.GRASS_DARK; break;
            case TileType.DIRT: color = COLORS.DIRT; break;
            case TileType.WALL: color = COLORS.STONE_FACE; break;
            case TileType.SNOW: color = (x + y) % 2 === 0 ? COLORS.SNOW_LIGHT : COLORS.SNOW_DARK; break;
            case TileType.ICE: color = COLORS.ICE; break;
            case TileType.SAND: color = (x + y) % 2 === 0 ? COLORS.SAND_LIGHT : COLORS.SAND_DARK; break;
            default: color = '#000';
          }
          ctx.fillStyle = color;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
};

// --- 2. VẼ NHÂN VẬT (CHARACTER RENDERER) ---
const drawPlayerSprite = (ctx: CanvasRenderingContext2D, player: Entity, tick: number, isMoving: boolean) => {
    const { x, y } = player.position;
    const facing = player.facing || 1;
    
    const runAnim = tick * 0.4;
    const breatheAnim = Math.sin(tick * 0.1) * 1;
    const bounce = isMoving ? Math.abs(Math.sin(runAnim)) * 3 : breatheAnim;
    
    // Animation tấn công
    const isAttacking = (player.attackTimer || 0) > 0;
    let attackProgress = 0;
    if (isAttacking) {
        attackProgress = 1 - (player.attackTimer! / 15);
    }

    ctx.save();
    
    const centerX = x + 16;
    const bottomY = y + 32;

    ctx.translate(centerX, bottomY);
    ctx.scale(facing, 1);

    // Bóng đổ
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 3, 0, 0, Math.PI * 2); ctx.fill();

    ctx.translate(0, -bounce);

    // Áo choàng
    const capeWave = isMoving ? Math.sin(runAnim - 1) * 5 : 0;
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.moveTo(-6, -20); ctx.lineTo(6, -20);
    ctx.lineTo(8 + capeWave, -2); ctx.lineTo(0 + capeWave * 1.2, 2); ctx.lineTo(-8 + capeWave, -2);
    ctx.fill();

    // Chân
    ctx.fillStyle = '#37474F';
    if (isMoving) {
        const leftLegAngle = Math.sin(runAnim) * 10;
        const rightLegAngle = Math.sin(runAnim + Math.PI) * 10;
        ctx.save(); ctx.translate(0, -10); ctx.rotate(rightLegAngle * Math.PI / 180); ctx.fillRect(-3, 0, 6, 12); ctx.restore();
        ctx.save(); ctx.translate(0, -10); ctx.rotate(leftLegAngle * Math.PI / 180); ctx.fillRect(-3, 0, 6, 12); ctx.restore();
    } else {
        ctx.fillRect(-5, -12, 5, 12); ctx.fillRect(1, -12, 5, 12);
    }

    // Thân & Đầu
    ctx.fillStyle = '#90A4AE'; ctx.fillRect(-7, -26, 14, 16); // Giáp ngực
    ctx.fillStyle = '#4E342E'; ctx.fillRect(-7, -14, 14, 4); // Belt
    ctx.fillStyle = '#FFD700'; ctx.fillRect(-2, -14, 4, 4); // Buckle
    ctx.fillStyle = '#B0BEC5'; ctx.fillRect(-7, -38, 14, 14); // Mũ
    ctx.fillStyle = '#C62828'; ctx.beginPath(); ctx.moveTo(-8, -38); ctx.lineTo(0, -44); ctx.lineTo(8, -38); ctx.fill(); // Mào
    ctx.fillStyle = '#263238'; ctx.fillRect(-5, -32, 12, 3); // Mắt

    // Tay & Vũ khí
    let armAngle = isAttacking 
        ? (attackProgress < 0.3 ? -100 - (attackProgress * 200) : -160 + ((attackProgress - 0.3) * 280))
        : (isMoving ? Math.sin(runAnim) * 30 : Math.sin(tick * 0.05) * 5);

    // Tay Khiên (Sau)
    ctx.save();
    ctx.translate(-6, -24); ctx.rotate(-armAngle * 0.5 * Math.PI / 180);
    ctx.fillStyle = '#78909C'; ctx.fillRect(-2, 0, 4, 8);
    ctx.translate(0, 8);
    ctx.fillStyle = '#1565C0'; ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(6, 0); ctx.lineTo(0, 8); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();

    // Tay Kiếm (Trước)
    ctx.save();
    ctx.translate(6, -24); ctx.rotate(armAngle * Math.PI / 180);
    ctx.fillStyle = '#78909C'; ctx.fillRect(-2, 0, 4, 10);
    ctx.translate(0, 8); ctx.rotate(-15 * Math.PI / 180);
    ctx.fillStyle = '#5D4037'; ctx.fillRect(-2, -2, 4, 6); // Cán
    ctx.fillStyle = '#FFD700'; ctx.fillRect(-6, -6, 12, 4); // Chắn
    ctx.fillStyle = '#E0E0E0'; ctx.fillRect(-3, -28, 6, 22); ctx.beginPath(); ctx.moveTo(-3, -28); ctx.lineTo(0, -34); ctx.lineTo(3, -28); ctx.fill(); // Lưỡi
    ctx.restore();

    // Hiệu ứng chém (Slash effect)
    if (isAttacking && attackProgress > 0.3 && attackProgress < 0.8) {
        ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(0, -20, 40, -Math.PI/4, Math.PI/2, false); ctx.lineTo(0, -20); ctx.fill();
        ctx.restore();
    }

    ctx.restore();

    // Tên (Không lật)
    ctx.fillStyle = 'white'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
    ctx.shadowColor="black"; ctx.shadowBlur=2;
    ctx.fillText(player.name || '', x + 16, y - 18 - bounce);
    ctx.shadowBlur=0;
};

// --- 3. VẼ QUÁI VẬT (MONSTER RENDERER) ---
const drawMonster = (ctx: CanvasRenderingContext2D, entity: Entity, tick: number) => {
    const { x, y } = entity.position;
    let color = entity.color || 'red';
    if (entity.hitTimer && entity.hitTimer > 0) color = '#FF8A80'; // Nháy đỏ khi trúng đòn

    // Helpers vẽ quái cụ thể
    const drawSlime = () => {
        const wobble = Math.sin(tick / 5) * 2;
        const width = 28 + wobble; const height = 24 - wobble;
        const cx = x + 16; const by = y + 30;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(cx - width/2, by); ctx.bezierCurveTo(cx - width/2, by - height, cx + width/2, by - height, cx + width/2, by); ctx.fill();
        ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(cx - 5, by - height/1.5 + wobble, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 5, by - height/1.5 + wobble, 3, 0, Math.PI*2); ctx.fill();
    };

    const drawGoblin = () => {
         const cx = x + 16; const cy = y + 16; const bob = Math.abs(Math.sin(tick / 5)) * 2;
         // Chân
         ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = 4;
         ctx.beginPath(); ctx.moveTo(cx - 4, cy + 10); ctx.lineTo(cx - 4, cy + 16); ctx.stroke();
         ctx.beginPath(); ctx.moveTo(cx + 4, cy + 10); ctx.lineTo(cx + 4, cy + 16); ctx.stroke();
         // Thân & Đầu
         ctx.fillStyle = color; ctx.fillRect(cx - 8, cy - 4 - bob, 16, 16);
         ctx.beginPath(); ctx.arc(cx, cy - 10 - bob, 9, 0, Math.PI * 2); ctx.fill();
         // Tai
         ctx.beginPath(); ctx.moveTo(cx - 8, cy - 10 - bob); ctx.lineTo(cx - 14, cy - 14 - bob); ctx.lineTo(cx - 7, cy - 8 - bob); ctx.fill();
         ctx.beginPath(); ctx.moveTo(cx + 8, cy - 10 - bob); ctx.lineTo(cx + 14, cy - 14 - bob); ctx.lineTo(cx + 7, cy - 8 - bob); ctx.fill();
         // Vũ khí
         ctx.strokeStyle = '#795548'; ctx.lineWidth = 3;
         ctx.beginPath(); ctx.moveTo(cx + 8, cy - bob); ctx.lineTo(cx + 14, cy + 4 - bob); ctx.stroke();
    };

    const drawGeneric = () => {
        ctx.fillStyle = color;
        ctx.fillRect(x + 8, y + 8, 16, 20);
    };

    if (entity.name?.includes('Slime') || entity.name?.includes('Blob')) drawSlime();
    else if (entity.name?.includes('Goblin') || entity.name?.includes('SandMan')) drawGoblin();
    else drawGeneric();

    // Thanh máu quái
    const hpPercent = Math.max(0, entity.health / entity.maxHealth);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + 4, y - 6, 24, 4);
    ctx.fillStyle = '#F44336'; ctx.fillRect(x + 4, y - 6, 24 * hpPercent, 4);
};

// --- 4. VẼ MÔI TRƯỜNG (Cây, Đá, Portal) ---
const drawEnvironment = (ctx: CanvasRenderingContext2D, entity: Entity, biome: BiomeType) => {
    const { x, y } = entity.position;
    const drawX = x;

    if (entity.type === 'tree') {
         // Bóng
         ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(drawX + 16, y + 28, 12, 6, 0, 0, Math.PI * 2); ctx.fill();
         // Thân
         ctx.fillStyle = COLORS.TREE_TRUNK; ctx.fillRect(drawX + 12, y + 10, 8, 20);
         // Tán lá
         ctx.fillStyle = biome === BiomeType.SNOW ? COLORS.PINE_LEAVES : COLORS.TREE_LEAVES;
         if (biome === BiomeType.SNOW) {
             ctx.beginPath(); ctx.moveTo(drawX + 16, y - 10); ctx.lineTo(drawX + 32, y + 25); ctx.lineTo(drawX, y + 25); ctx.fill();
             ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(drawX + 16, y - 10); ctx.lineTo(drawX + 22, y + 5); ctx.lineTo(drawX + 10, y + 5); ctx.fill();
         } else if (biome === BiomeType.DESERT) {
             ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 3;
             ctx.beginPath(); ctx.moveTo(drawX+16, y+30); ctx.lineTo(drawX+16, y+10); ctx.stroke();
             ctx.beginPath(); ctx.moveTo(drawX+16, y+20); ctx.lineTo(drawX+10, y+15); ctx.stroke();
         } else {
             ctx.beginPath(); ctx.arc(drawX + 16, y + 10, 14, 0, Math.PI * 2); ctx.fill();
             ctx.fillStyle = '#D32F2F'; ctx.beginPath(); ctx.arc(drawX + 12, y + 8, 2, 0, Math.PI*2); ctx.fill();
         }
    } else if (entity.type === 'rock') {
        ctx.fillStyle = COLORS.STONE_FACE;
        ctx.beginPath(); ctx.arc(drawX+16, y+20, 10, 0, Math.PI*2); ctx.fill();
    } else if (entity.type === 'portal') {
        ctx.fillStyle = COLORS.PORTAL;
        ctx.beginPath(); ctx.rect(drawX + 10, y + 10, 20, 20); ctx.fill();
        ctx.fillStyle = 'white'; ctx.font = '10px monospace'; ctx.fillText("PORTAL", drawX + 20, y - 5);
    }
    
    // Thanh máu môi trường (nếu chưa chết)
    if (entity.health < entity.maxHealth && !entity.isDying) {
         const hpPercent = Math.max(0, entity.health / entity.maxHealth);
         ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + 4, y - 6, 24, 4);
         ctx.fillStyle = '#4CAF50'; ctx.fillRect(x + 4, y - 6, 24 * hpPercent, 4);
    }
};

// --- HÀM EXPORT CHÍNH ---
export const drawAllEntities = (ctx: CanvasRenderingContext2D, gameState: GameState, tick: number, inputVector: {x: number, y: number}) => {
    // Sắp xếp theo trục Y (người đứng trước cây thì vẽ sau)
    const allRender = [...gameState.map.entities, gameState.player, ...gameState.projectiles];
    allRender.sort((a, b) => a.position.y - b.position.y);

    allRender.forEach(ent => {
        // Culling (Chỉ vẽ những gì trong màn hình)
        const margin = 64;
        if (ent.position.x < gameState.camera.x - margin || ent.position.x > gameState.camera.x + ctx.canvas.width + margin ||
            ent.position.y < gameState.camera.y - margin || ent.position.y > gameState.camera.y + ctx.canvas.height + margin) {
            return;
        }

        ctx.save();
        
        // Hiệu ứng chết (đổ xuống)
        if (ent.isDying) {
             const cx = ent.position.x + 16; const cy = ent.position.y + 32;
             ctx.translate(cx, cy);
             ctx.rotate((ent.rotation || 0) * Math.PI / 180);
             ctx.translate(-cx, -cy);
             ctx.globalAlpha = Math.max(0, 1 - (ent.deathTimer || 0) / 60);
        }

        // Rung lắc khi bị đánh
        if (ent.shakeX) ctx.translate((Math.random() - 0.5) * ent.shakeX, 0);

        if (ent.type === 'player') {
             const isMoving = Math.abs(inputVector.x) > 0 || Math.abs(inputVector.y) > 0;
             drawPlayerSprite(ctx, ent, tick, isMoving);
        } else if (ent.type === 'monster') {
             drawMonster(ctx, ent, tick);
        } else if (ent.type === 'tree' || ent.type === 'rock' || ent.type === 'portal') {
             drawEnvironment(ctx, ent, gameState.map.biome);
        } else if (ent.type === 'projectile') {
             ctx.fillStyle = COLORS.PROJECTILE;
             ctx.shadowColor = COLORS.PROJECTILE; ctx.shadowBlur = 10;
             ctx.beginPath(); ctx.arc(ent.position.x, ent.position.y, 6, 0, Math.PI*2); ctx.fill();
             ctx.shadowBlur = 0;
        }

        ctx.restore();
    });
};

export const drawUIEffects = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    gameState.floatingTexts.forEach(ft => {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px monospace';
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    });
};
