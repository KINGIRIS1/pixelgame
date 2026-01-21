
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, PLAYER_SPEED, TileType } from '../../constants';
import { GameState } from '../../types';
import { checkCollision, getHitbox } from '../../utils/gameUtils';
import { applyDamage } from './CombatLogic';

export const updatePlayer = (state: GameState, input: {x: number, y: number}) => {
    const { player, map } = state;

    // Giảm timer cooldown
    if (player.attackTimer && player.attackTimer > 0) player.attackTimer--;

    // Di chuyển
    if (input.x !== 0 || input.y !== 0) {
        // Cập nhật hướng mặt
        if (input.x !== 0) player.facing = input.x > 0 ? 1 : -1;

        // --- HÀM KIỂM TRA ĐỊA HÌNH ---
        const isWalkable = (x: number, y: number) => {
            const tileX = Math.floor((x + 12) / TILE_SIZE); // +12 để check tâm chân
            const tileY = Math.floor((y + 24) / TILE_SIZE);
            if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) return false;
            const tile = map.tiles[tileY][tileX];
            // Không đi được vào Tường hoặc Nước
            return tile !== TileType.WALL && tile !== TileType.WATER;
        };

        // --- XỬ LÝ TRỤC X ---
        const nextX = player.position.x + input.x * PLAYER_SPEED;
        const boxX = getHitbox({x: nextX, y: player.position.y}, player.size, 'player');
        
        // Check biên map
        const insideMapX = boxX.x >= 0 && (boxX.x + boxX.w) <= MAP_WIDTH * TILE_SIZE;
        // Lấy danh sách vật cản (cây/đá)
        const staticEntities = map.entities.filter(e => (e.type === 'tree' || e.type === 'rock') && !e.isDying);

        // Check tổng hợp: Trong map + Không đâm cây + Không đi vào tường/nước
        if (insideMapX && 
            !checkCollision({x: nextX, y: player.position.y}, player.size, staticEntities) &&
            isWalkable(nextX, player.position.y)
           ) {
            player.position.x = nextX;
        }

        // --- XỬ LÝ TRỤC Y ---
        const nextY = player.position.y + input.y * PLAYER_SPEED;
        const currentX = player.position.x; 
        const boxY = getHitbox({x: currentX, y: nextY}, player.size, 'player');
        
        const insideMapY = boxY.y >= 0 && (boxY.y + boxY.h) <= MAP_HEIGHT * TILE_SIZE;

        if (insideMapY && 
            !checkCollision({x: currentX, y: nextY}, player.size, staticEntities) &&
            isWalkable(currentX, nextY)
           ) {
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
             
             // Hitbox tấn công rộng hơn một chút
             if (Math.sqrt(dx*dx + dy*dy) < 70) { 
                 setTimeout(() => applyDamage(state, ent, player.damage || 20, player.position), 100);
             }
        }
    });
};
