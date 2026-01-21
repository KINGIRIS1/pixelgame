
import { GameState, Entity, Item } from '../types';
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, PLAYER_SPEED, COLORS } from '../constants';
import { checkCollision } from '../utils/gameUtils';

/**
 * MODULE: GAME LOGIC
 * Nhiệm vụ: Xử lý mọi tính toán, logic game, AI, va chạm.
 */

// --- UTILS TRONG LOGIC ---
const addFloatingText = (state: GameState, text: string, x: number, y: number, color: string) => {
    state.floatingTexts.push({
        id: Date.now() + Math.random(),
        text, x, y, color, life: 60
    });
};

const addItemToBag = (state: GameState, item: Item) => {
    const existing = state.inventory.find(i => i.id === item.id);
    if (existing) {
        existing.quantity += item.quantity;
    } else {
        state.inventory.push(item);
    }
    addFloatingText(state, `+${item.quantity} ${item.name}`, state.player.position.x, state.player.position.y - 40, '#FFF');
};

// --- 1. LOGIC COMBAT (Sát thương, chết) ---
export const applyDamage = (state: GameState, target: Entity, amount: number, sourcePos: {x: number, y: number}) => {
    target.health -= amount;
    target.hitTimer = 10;
    target.shakeX = 5;

    // Knockback
    const dx = target.position.x - sourcePos.x;
    const dy = target.position.y - sourcePos.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    target.position.x += (dx/dist) * 20;
    target.position.y += (dy/dist) * 20;

    addFloatingText(state, `-${amount}`, target.position.x, target.position.y - 10, '#FFEB3B');

    // Kiểm tra chết
    if (target.health <= 0 && !target.isDying) {
        target.isDying = true;
        target.deathTimer = 0;
        target.rotation = 0;
        
        // Loot đồ khi quái chết
        if (target.type === 'monster') {
             addFloatingText(state, "+EXP", target.position.x, target.position.y, '#69F0AE');
             if (Math.random() > 0.5) {
                addItemToBag(state, { id: 'coin', name: 'Vàng', icon: '💰', type: 'material', quantity: Math.floor(Math.random() * 10) + 1 });
             }
        }
    }
};

// --- 2. LOGIC NGƯỜI CHƠI (Di chuyển, Tấn công) ---
export const updatePlayer = (state: GameState, input: {x: number, y: number}) => {
    const { player, map } = state;

    // Giảm timer cooldown
    if (player.attackTimer && player.attackTimer > 0) player.attackTimer--;

    // Di chuyển
    if (input.x !== 0 || input.y !== 0) {
        if (input.x !== 0) player.facing = input.x > 0 ? 1 : -1;

        const nextX = player.position.x + input.x * PLAYER_SPEED;
        const nextY = player.position.y + input.y * PLAYER_SPEED;

        const staticEntities = map.entities.filter(e => (e.type === 'tree' || e.type === 'rock') && !e.isDying);

        // Check bound & va chạm
        if (nextX >= 0 && nextX <= MAP_WIDTH * TILE_SIZE - 32 && !checkCollision({x: nextX, y: player.position.y}, player.size, staticEntities)) {
            player.position.x = nextX;
        }
        if (nextY >= 0 && nextY <= MAP_HEIGHT * TILE_SIZE - 32 && !checkCollision({x: player.position.x, y: nextY}, player.size, staticEntities)) {
            player.position.y = nextY;
        }
    }
};

export const handlePlayerAttack = (state: GameState) => {
    const { player, map } = state;
    player.attackTimer = 15; // Set animation

    map.entities.forEach(ent => {
        if ((ent.type === 'monster' || ent.type === 'tree') && !ent.isDying) {
             const dx = ent.position.x - player.position.x;
             const dy = ent.position.y - player.position.y;
             if (Math.sqrt(dx*dx + dy*dy) < 70) { // Tầm đánh
                 setTimeout(() => applyDamage(state, ent, player.damage || 20, player.position), 100);
             }
        }
    });
};

// --- 3. LOGIC QUÁI VẬT (AI Chase, Attack) ---
export const updateMonsters = (state: GameState) => {
    const { player, map } = state;

    map.entities.forEach(ent => {
        if (ent.isDying) {
            ent.deathTimer = (ent.deathTimer || 0) + 1;
            if (ent.type === 'tree') ent.rotation = (ent.rotation || 0) + 2;
            return;
        }
        
        // Hiệu ứng visual giảm dần
        if (ent.hitTimer && ent.hitTimer > 0) ent.hitTimer--;
        if (ent.shakeX && ent.shakeX > 0) ent.shakeX *= 0.8;

        if (ent.type === 'monster') {
            const dx = player.position.x - ent.position.x;
            const dy = player.position.y - ent.position.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // AI: Đuổi theo player
            if (dist < 300 && dist > 10) {
                ent.position.x += (dx / dist) * (ent.speed || 1);
                ent.position.y += (dy / dist) * (ent.speed || 1);
            }

            // AI: Tấn công player
            if (dist < 20) {
                if (Math.random() < 0.05) {
                    player.health = Math.max(0, player.health - (ent.damage || 1));
                    addFloatingText(state, `-${ent.damage}`, player.position.x, player.position.y, '#FF0000');
                }
            }
        }
    });

    // Dọn dẹp xác chết
    map.entities = map.entities.filter(e => !e.isDying || (e.deathTimer || 0) < 60);
};

// --- 4. LOGIC PROJECTILES (Đạn bay) ---
export const updateProjectiles = (state: GameState) => {
    const { projectiles, map } = state;
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        if (!p.target) continue;

        p.position.x += p.target.x;
        p.position.y += p.target.y;

        if (Date.now() - (p.createAt || 0) > 2000) { // Hết hạn
            projectiles.splice(i, 1);
            continue;
        }

        // Check va chạm với quái
        let hit = false;
        map.entities.forEach(ent => {
            if (ent.type === 'monster' && !ent.isDying) {
                const dx = ent.position.x - p.position.x;
                const dy = ent.position.y - p.position.y;
                if (Math.sqrt(dx*dx + dy*dy) < 20) {
                    applyDamage(state, ent, p.damage || 0, p.position);
                    hit = true;
                }
            }
        });
        if (hit) projectiles.splice(i, 1);
    }
};

export const updateFloatingTexts = (state: GameState) => {
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        state.floatingTexts[i].y -= 0.5;
        state.floatingTexts[i].life--;
        if (state.floatingTexts[i].life <= 0) state.floatingTexts.splice(i, 1);
    }
};
