
import { GameState } from '../../types';

export const drawUIEffects = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    gameState.floatingTexts.forEach(ft => {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px monospace';
      ctx.strokeStyle = 'black'; ctx.lineWidth = 2;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    });
};
