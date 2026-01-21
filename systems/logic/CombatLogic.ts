
import { GameState, Entity, Item } from '../../types';

// Utils nội bộ
const addFloatingText = (state: GameState, text: string, x: number, y: number, color: string) => {
    state.floatingTexts.push({ id: Date.now() + Math.random(), text, x, y, color, life: 60 });
};

const addItemToBag = (state: GameState, item: Item) => {
    const existing = state.inventory.find(i => i.id === item.id);
    if (existing) existing.quantity += item.quantity;
    else state.inventory.push(item);
    addFloatingText(state, `+${item.quantity} ${item.name}`, state.player.position.x, state.player.position.y - 40, '#FFF');
};

export const applyDamage = (state: GameState, target: Entity, amount: number, sourcePos: {x: number, y: number}) => {
    target.health -= amount;
    target.hitTimer = 10;
    target.shakeX = 5;

    const dx = target.position.x - sourcePos.x;
    const dy = target.position.y - sourcePos.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    target.position.x += (dx/dist) * 20;
    target.position.y += (dy/dist) * 20;

    addFloatingText(state, `-${amount}`, target.position.x, target.position.y - 10, '#FFEB3B');

    if (target.health <= 0 && !target.isDying) {
        target.isDying = true;
        target.deathTimer = 0;
        target.rotation = 0;
        if (target.type === 'monster') {
             addFloatingText(state, "+EXP", target.position.x, target.position.y, '#69F0AE');
             if (Math.random() > 0.5) {
                addItemToBag(state, { id: 'coin', name: 'Vàng', icon: '💰', type: 'material', quantity: Math.floor(Math.random() * 10) + 1 });
             }
        }
    }
};

export const updateProjectiles = (state: GameState) => {
    const { projectiles, map } = state;
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        if (!p.target) continue;
        p.position.x += p.target.x;
        p.position.y += p.target.y;

        if (Date.now() - (p.createAt || 0) > 2000) { projectiles.splice(i, 1); continue; }

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
