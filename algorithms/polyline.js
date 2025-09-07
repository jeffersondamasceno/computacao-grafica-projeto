import { bresenhamLine } from './bresenham.js';

export class Polyline {
    /**
     * Desenha uma polilinha conectando uma série de pontos.
     * Uma polilinha é uma sequência de segmentos de reta conectados.
     * @param {object} graphics - A instância da classe GraphicsCanvas, para ter acesso a métodos como drawPixel.
     * @param {Array<object>} points - Array de objetos de ponto {x, y}.
     */
    static drawPolyline(graphics, points) {
        // Para desenhar uma linha, precisamos de pelo menos 2 pontos.
        if (!points || points.length < 2) {
            console.error("Para desenhar uma polilinha, são necessários pelo menos dois pontos.");
            return;
        }

        // Itera por todos os pontos, desenhando um segmento de reta entre o ponto atual e o próximo.
        for (let i = 0; i < points.length - 1; i++) {
            const startPoint = points[i];
            const endPoint = points[i + 1];
            // Utiliza o algoritmo de Bresenham para desenhar o segmento.
            bresenhamLine(graphics, startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        }
    }

    /**
     * Desenha uma polilinha fechada (polígono), conectando o último ponto de volta ao primeiro.
     * @param {object} graphics - A instância da classe GraphicsCanvas.
     * @param {Array<object>} points - Array de objetos de ponto {x, y} que formam os vértices do polígono.
     */
    static drawPolygon(graphics, points) {
        // Para desenhar um polígono, precisamos de pelo menos 3 pontos.
        if (!points || points.length < 3) {
            console.error("Para desenhar um polígono, são necessários pelo menos três pontos.");
            return;
        }

        // Desenha todos os segmentos da polilinha.
        this.drawPolyline(graphics, points);

        // Conecta o último ponto de volta ao primeiro para fechar a forma.
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        bresenhamLine(graphics, lastPoint.x, lastPoint.y, firstPoint.x, firstPoint.y);
    }

    /**
     * Calcula e retorna todos os pixels individuais que compõem uma polilinha.
     * Esta função não desenha no canvas, apenas retorna as coordenadas.
     * @param {Array<object>} points - Array de objetos de ponto {x, y}.
     * @returns {Array<object>} Um array com todos os pontos {x, y} que formam a polilinha rasterizada.
     */
    static getPolylinePoints(points) {
        if (!points || points.length < 2) {
            return [];
        }

        const allPixels = [];

        // Itera por todos os segmentos da polilinha.
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            
            // Lógica de Bresenham para calcular os pontos de um segmento
            let x0 = p1.x, y0 = p1.y, x1 = p2.x, y1 = p2.y;
            let dx = Math.abs(x1 - x0);
            let dy = Math.abs(y1 - y0);
            const sx = (x0 < x1) ? 1 : -1;
            const sy = (y0 < y1) ? 1 : -1;
            let err = dx - dy;

            while (true) {
                allPixels.push({ x: x0, y: y0 });
                if (x0 === x1 && y0 === y1) break;
                const e2 = 2 * err;
                if (e2 > -dy) { err -= dy; x0 += sx; }
                if (e2 < dx) { err += dx; y0 += sy; }
            }
        }
        
        return allPixels;
    }
}