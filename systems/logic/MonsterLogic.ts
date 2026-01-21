
import { GameState } from '../../types';

export const updateMonsters = (state: GameState) => {
    const { player, map } = state;

    map.entities.forEach(ent => {
        if (ent.isDying) {
            ent.deathTimer = (ent.deathTimer || 0) + 1;
            if (ent.type === 'tree') ent.rotation = (ent.rotation || 0) + 2;
            return;
        }
        
        if (ent.hitTimer && ent.hitTimer > 0) ent.hitTimer--;
        if (ent.shakeX && ent.shakeX > 0) ent.shakeX *= 0.8;

        if (ent.type === 'monster') {
            const dx = player.position.x - ent.position.x;
            const dy = player.position.y - ent.position.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // Chase
            if (dist < 300 && dist > 10) {
                ent.position.x += (dx / dist) * (ent.speed || 1);
                ent.position.y += (dy / dist) * (ent.speed || 1);
            }
            // Attack
            if (dist < 20) {
                if (Math.random() < 0.05) {
                    player.health = Math.max(0, player.health - (ent.damage || 1));
                    state.floatingTexts.push({ id: Date.now()+Math.random(), text: `-${ent.damage}`, x: player.position.x, y: player.position.y, color: '#FF0000', life: 60 });
                }
            }
        }
    });

    map.entities = map.entities.filter(e => !e.isDying || (e.deathTimer || 0) < 60);
};
