
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from '../constants';
import { GameState, Entity, GameRef } from '../types';
import { generateMap } from '../utils/gameUtils';

import { drawMap } from '../systems/render/MapRenderer';
import { drawAllEntities } from '../systems/render/EntityRenderer';
import { drawUIEffects } from '../systems/render/EffectRenderer';
import { updatePlayer, handlePlayerAttack } from '../systems/logic/PlayerLogic';
import { updateMonsters } from '../systems/logic/MonsterLogic';
import { updateProjectiles, updateFloatingTexts } from '../systems/logic/CombatLogic';

interface Props {
  inputVector: { x: number, y: number };
  onPlayerUpdate: (player: Entity) => void;
}

const GameCanvas = forwardRef<GameRef, Props>(({ inputVector, onPlayerUpdate }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef(inputVector);

  useEffect(() => {
    inputRef.current = inputVector;
  }, [inputVector]);
  
  // KHỞI TẠO STATE BAN ĐẦU (LEVEL 0)
  const gameState = useRef<GameState>({
    player: {
      id: 'player', type: 'player',
      position: { x: 5 * TILE_SIZE, y: (MAP_HEIGHT / 2) * TILE_SIZE },
      size: 24, health: 450, maxHealth: 600, name: 'Dũng Sĩ',
      damage: 35, facing: 1, attackTimer: 0
    },
    inventory: [
       { id: 'pot_hp', name: 'Máu Nhỏ', icon: '🧪', type: 'potion', quantity: 3 },
       { id: 'sword_1', name: 'Kiếm Gỗ', icon: '🗡️', type: 'weapon', quantity: 1 }
    ],
    camera: { x: 0, y: 0 },
    map: generateMap(0), // Start Level 0
    projectiles: [],
    floatingTexts: []
  });

  const frameId = useRef<number>(0);
  const tickRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  useImperativeHandle(ref, () => ({
    attack: () => { handlePlayerAttack(gameState.current); },
    skill1: () => {
       const { player } = gameState.current;
       player.health = Math.min(player.health + 50, player.maxHealth);
       gameState.current.floatingTexts.push({id: Date.now(), text: "HỒI MÁU", x: player.position.x, y: player.position.y - 30, color: '#42A5F5', life: 60});
    },
    skill2: () => {
       const { player, projectiles } = gameState.current;
       let vx = inputRef.current.x;
       let vy = inputRef.current.y;
       if (vx === 0 && vy === 0) { vx = player.facing || 1; vy = 0; }
       const speed = 8;
       const mag = Math.sqrt(vx*vx + vy*vy);
       projectiles.push({
        id: `fireball-${Date.now()}`, type: 'projectile',
        position: { x: player.position.x + 16, y: player.position.y + 16 },
        target: { x: (vx/mag) * speed, y: (vy/mag) * speed },
        size: 10, health: 1, maxHealth: 1, damage: 60, createAt: Date.now()
      });
      gameState.current.floatingTexts.push({id: Date.now(), text: "HỎA CẦU", x: player.position.x, y: player.position.y - 30, color: '#FF5722', life: 60});
      player.attackTimer = 10;
    }
  }));

  const update = () => {
    if (!gameState.current) return;
    const state = gameState.current;

    // UPDATE LOGIC
    updatePlayer(state, inputRef.current);
    updateMonsters(state);
    updateProjectiles(state);
    updateFloatingTexts(state);

    // CAMERA FOLLOW
    if (canvasRef.current) {
      const viewW = canvasRef.current.width;
      const viewH = canvasRef.current.height;
      let camX = state.player.position.x - viewW / 2 + 16;
      let camY = state.player.position.y - viewH / 2 + 16;
      camX = Math.max(0, Math.min(camX, MAP_WIDTH * TILE_SIZE - viewW));
      camY = Math.max(0, Math.min(camY, MAP_HEIGHT * TILE_SIZE - viewH));
      state.camera = { x: camX, y: camY };
    }

    // CHECK PORTAL / LEVEL UP
    const portal = state.map.entities.find(e => e.type === 'portal');
    if (portal) {
         const dx = state.player.position.x - portal.position.x;
         const dy = state.player.position.y - portal.position.y;
         if (Math.sqrt(dx*dx + dy*dy) < 40) {
            // NEXT LEVEL LOGIC
            const nextLevel = state.map.levelIndex + 1;
            state.floatingTexts.push({id: Date.now(), text: `LEVEL ${nextLevel}`, x: state.player.position.x, y: state.player.position.y, color: '#FFF', life: 120});
            
            // Generate Map mới
            state.map = generateMap(nextLevel);
            state.projectiles = [];
            // Reset vị trí player về đầu map
            state.player.position = { x: 4 * TILE_SIZE, y: (MAP_HEIGHT/2) * TILE_SIZE };
         }
    }
    
    if (tickRef.current % 10 === 0) onPlayerUpdate(state.player);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = gameState.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-Math.floor(state.camera.x), -Math.floor(state.camera.y));

    drawMap(ctx, state.map, state.camera, canvas.width, canvas.height, tickRef.current);
    drawAllEntities(ctx, state, tickRef.current, inputRef.current);
    drawUIEffects(ctx, state);

    ctx.restore();

    // Vignette
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const gradient = ctx.createRadialGradient(cx, cy, canvas.width * 0.3, cx, cy, canvas.width * 0.8);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Map Name UI
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
    ctx.fillText(state.map.name || `Level ${state.map.levelIndex}`, canvas.width - 20, 40);
    ctx.font = '14px monospace';
    ctx.fillText(`Difficulty: ${state.map.difficulty}`, canvas.width - 20, 60);
    ctx.shadowBlur = 0;
  };

  const loop = () => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    if (delta > 16) { 
      tickRef.current++;
      update();
      draw();
      lastTimeRef.current = now;
    }
    frameId.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    frameId.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="block bg-[#1a1a1a]" />;
});

export default GameCanvas;
