
import { COLORS, BiomeType } from '../../constants';
import { Entity, GameState } from '../../types';
import { MONSTER_DB } from '../../data/gameData';

// --- HELPER ---
const drawPixelSprite = (ctx: CanvasRenderingContext2D, matrix: number[][], pixelSize: number, palette: {[key: number]: string}) => {
    for(let r=0; r<matrix.length; r++) {
        for(let c=0; c<matrix[r].length; c++) {
            const val = matrix[r][c];
            if(val !== 0 && palette[val]) {
                ctx.fillStyle = palette[val];
                ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
            }
        }
    }
};

// --- VẼ NHÂN VẬT (Player) ---
const drawPlayerSprite = (ctx: CanvasRenderingContext2D, player: Entity, tick: number, isMoving: boolean) => {
    const { x, y } = player.position;
    const facing = player.facing || 1;
    const runAnim = tick * 0.4;
    const bounce = isMoving ? Math.abs(Math.sin(runAnim)) * 3 : Math.sin(tick * 0.1);
    
    ctx.save();
    ctx.translate(x + 16, y + 32);
    ctx.scale(facing, 1);
    
    // Bóng
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(0, -bounce);

    // Áo choàng
    ctx.fillStyle = '#B71C1C';
    ctx.fillRect(-8, -22, 16, 18);

    // Thân & Đầu
    ctx.fillStyle = '#78909C'; ctx.fillRect(-7, -26, 14, 20); // Giáp
    ctx.fillStyle = '#F5CB98'; ctx.fillRect(-5, -34, 10, 8); // Mặt
    ctx.fillStyle = '#546E7A'; ctx.fillRect(-7, -40, 14, 12); // Mũ
    ctx.fillStyle = '#D32F2F'; ctx.fillRect(0, -44, 2, 6); // Mào

    // Kiếm
    ctx.save();
    ctx.translate(8, -18);
    const isAttacking = (player.attackTimer || 0) > 0;
    if (isAttacking) ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#FFD54F'; ctx.fillRect(-2, -2, 4, 12); // Cán
    ctx.fillStyle = '#CFD8DC'; ctx.fillRect(-2, -24, 4, 22); // Lưỡi
    ctx.restore();

    ctx.restore();
    
    // Name
    ctx.fillStyle = 'white'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
    ctx.fillText(player.name || '', x + 16, y - 20 - bounce);
};

// --- VẼ QUÁI VẬT (PROCEDURAL PIXEL ART) ---
const drawMonster = (ctx: CanvasRenderingContext2D, entity: Entity, tick: number) => {
    const { x, y } = entity.position;
    let color = entity.color || 'red';
    if (entity.hitTimer && entity.hitTimer > 0) color = '#FFEB3B'; 

    const bob = Math.floor(Math.sin(tick * 0.1) * 2);

    ctx.save();
    ctx.translate(x + entity.size/2, y + entity.size/2 + bob);

    // Tìm style vẽ dựa trên dữ liệu (nếu có map trong tên) hoặc mặc định
    let style = 'slime';
    // Tìm trong DB nếu có ID khớp
    const dbEntry = Object.values(MONSTER_DB).find(m => entity.name === m.name);
    if (dbEntry) style = dbEntry.spriteStyle;

    if (style === 'slime') {
        const slimePalette = { 1: color, 2: 'white', 3: 'black' };
        const slimeSprite = [
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,2,1,1,0],
            [1,1,3,1,3,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0],
        ];
        ctx.translate(-16, -10);
        drawPixelSprite(ctx, slimeSprite, 4, slimePalette);

    } else if (style === 'bat') {
        const batPalette = { 1: color, 2: '#D32F2F' };
        const flap = Math.sin(tick * 0.5) > 0;
        const batSprite = flap ? [
            [1,0,0,0,0,0,1],
            [1,1,0,0,0,1,1],
            [0,1,1,1,1,1,0],
            [0,0,1,2,1,0,0]
        ] : [
            [0,0,1,0,1,0,0],
            [0,1,1,1,1,1,0],
            [1,1,1,1,1,1,1],
            [0,0,1,2,1,0,0]
        ];
        ctx.translate(-14, -8);
        drawPixelSprite(ctx, batSprite, 4, batPalette);

    } else if (style === 'skeleton' || style === 'shadow_knight') {
        const skelPalette = { 1: '#BDBDBD', 2: color, 3: 'red' }; // 2 is armor/darkness
        const skelSprite = [
            [0,0,1,1,1,0,0],
            [0,0,1,3,1,0,0], // Head
            [0,1,2,2,2,1,0], // Ribs/Armor
            [0,0,1,1,1,0,0], // Spine
            [0,1,0,0,0,1,0]  // Legs
        ];
        ctx.translate(-14, -14);
        drawPixelSprite(ctx, skelSprite, 4, skelPalette);
        // Kiếm
        ctx.fillStyle = '#90A4AE'; ctx.fillRect(14, -5, 2, 16);

    } else if (style === 'golem' || style === 'boss_worm') {
        const golemPalette = { 1: color, 2: '#3E2723', 3: '#FFCA28' }; 
        const golemSprite = [
             [0,1,1,1,1,0],
             [1,1,3,3,1,1], // Eyes
             [1,1,1,1,1,1],
             [2,1,1,1,1,2], // Arms
             [1,0,0,0,0,1]
        ];
        const scale = entity.role === 'boss' ? 8 : 5;
        ctx.translate(-3 * scale, -3 * scale);
        drawPixelSprite(ctx, golemSprite, scale, golemPalette);
    } else {
        // Fallback Goblin
        ctx.fillStyle = color;
        ctx.fillRect(-8, -12, 16, 16);
        ctx.fillStyle = 'green';
        ctx.fillRect(-12, -10, 4, 4); ctx.fillRect(8, -10, 4, 4); // Tai
    }

    ctx.restore();

    // HP Bar
    const hpPercent = Math.max(0, entity.health / entity.maxHealth);
    const barWidth = entity.role === 'boss' ? 48 : 24;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + (entity.size - barWidth)/2, y - 8, barWidth, 4);
    ctx.fillStyle = '#F44336'; ctx.fillRect(x + (entity.size - barWidth)/2, y - 8, barWidth * hpPercent, 4);
};

// --- VẼ MÔI TRƯỜNG ---
const drawEnvironment = (ctx: CanvasRenderingContext2D, entity: Entity, biome: BiomeType) => {
    const { x, y } = entity.position;
    const drawX = x;

    if (entity.type === 'tree') {
         ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(drawX + 16, y + 28, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
         ctx.fillStyle = COLORS.TREE_TRUNK; ctx.fillRect(drawX + 12, y + 10, 8, 20);

         const leafColor = biome === BiomeType.SNOW ? COLORS.PINE_LEAVES : COLORS.TREE_LEAVES;
         if (biome === BiomeType.SNOW) {
             ctx.fillStyle = leafColor;
             ctx.beginPath(); ctx.moveTo(drawX + 16, y - 10); ctx.lineTo(drawX + 32, y + 25); ctx.lineTo(drawX, y + 25); ctx.fill();
             ctx.fillStyle = 'white'; // Tuyết
             ctx.beginPath(); ctx.moveTo(drawX + 16, y - 10); ctx.lineTo(drawX + 22, y + 5); ctx.lineTo(drawX + 10, y + 5); ctx.fill();
         } else if (biome === BiomeType.DESERT) {
             ctx.fillStyle = COLORS.CACTUS;
             ctx.fillRect(drawX+12, y, 8, 30);
             ctx.fillRect(drawX+4, y+10, 8, 6); ctx.fillRect(drawX+4, y+4, 6, 8);
         } else if (biome === BiomeType.SWAMP) {
             // Cây khô héo
             ctx.fillStyle = '#4E342E';
             ctx.fillRect(drawX+14, y, 4, 30);
             ctx.fillRect(drawX+8, y+10, 6, 2);
         } else {
             ctx.fillStyle = leafColor;
             ctx.beginPath(); ctx.arc(drawX + 16, y + 5, 14, 0, Math.PI * 2); ctx.fill();
         }
    } else if (entity.type === 'rock') {
        ctx.fillStyle = '#757575';
        ctx.beginPath(); ctx.arc(drawX+16, y+20, 10, 0, Math.PI*2); ctx.fill();
    } else if (entity.type === 'portal') {
        ctx.save();
        ctx.translate(drawX + 20, y + 20);
        ctx.rotate(Date.now() * 0.005);
        ctx.fillStyle = COLORS.PORTAL;
        ctx.fillRect(-12, -12, 24, 24);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = COLORS.PORTAL_INNER;
        ctx.fillRect(-8, -8, 16, 16);
        ctx.restore();
    } else if (entity.type === 'chest') {
        ctx.fillStyle = '#FFC107'; // Gold chest
        ctx.fillRect(x + 8, y + 12, 16, 12);
        ctx.strokeStyle = '#3E2723'; ctx.lineWidth = 2;
        ctx.strokeRect(x + 8, y + 12, 16, 12);
    }
    
    // HP bar for destroyables (optional)
    if (entity.health < entity.maxHealth && !entity.isDying && entity.type !== 'portal' && entity.type !== 'chest') {
         const hpPercent = Math.max(0, entity.health / entity.maxHealth);
         ctx.fillStyle = '#4CAF50'; ctx.fillRect(x + 4, y - 6, 24 * hpPercent, 4);
    }
};

export const drawAllEntities = (ctx: CanvasRenderingContext2D, gameState: GameState, tick: number, inputVector: {x: number, y: number}) => {
    // Sort Y
    const allRender = [...gameState.map.entities, gameState.player, ...gameState.projectiles];
    allRender.sort((a, b) => a.position.y - b.position.y);

    allRender.forEach(ent => {
        const margin = 64;
        if (ent.position.x < gameState.camera.x - margin || ent.position.x > gameState.camera.x + ctx.canvas.width + margin ||
            ent.position.y < gameState.camera.y - margin || ent.position.y > gameState.camera.y + ctx.canvas.height + margin) {
            return;
        }

        ctx.save();
        if (ent.isDying) {
             const cx = ent.position.x + ent.size/2; const cy = ent.position.y + ent.size;
             ctx.translate(cx, cy);
             ctx.rotate((ent.rotation || 0) * Math.PI / 180);
             ctx.translate(-cx, -cy);
             ctx.globalAlpha = Math.max(0, 1 - (ent.deathTimer || 0) / 60);
        }
        if (ent.shakeX) ctx.translate((Math.random() - 0.5) * ent.shakeX, 0);

        if (ent.type === 'player') {
             const isMoving = Math.abs(inputVector.x) > 0 || Math.abs(inputVector.y) > 0;
             drawPlayerSprite(ctx, ent, tick, isMoving);
        } else if (ent.type === 'monster') {
             drawMonster(ctx, ent, tick);
        } else if (ent.type === 'projectile') {
             ctx.fillStyle = COLORS.PROJECTILE;
             ctx.beginPath(); ctx.arc(ent.position.x, ent.position.y, 6, 0, Math.PI*2); ctx.fill();
        } else {
             drawEnvironment(ctx, ent, gameState.map.biome);
        }
        ctx.restore();
    });
};
