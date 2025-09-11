/**
 * @file Implementa o desenho de Curvas de Bézier Quadráticas.
 * Utiliza o Algoritmo de De Casteljau para calcular os pontos e
 * o Algoritmo de Bresenham para rasterizar a curva.
 */

// Importamos Bresenham porque vamos usá-lo para conectar os pontos da curva.
import { bresenhamLine } from './bresenham.js';

/**
 * Calcula um ponto em uma curva de Bézier quadrática usando o Algoritmo de De Casteljau.
 * @param {{x: number, y: number}} p0 - Ponto de controle 0 (início).
 * @param {{x: number, y: number}} p1 - Ponto de controle 1 (guia).
 * @param {{x: number, y: number}} p2 - Ponto de controle 2 (fim).
 * @param {number} t - Parâmetro da curva, varia de 0 a 1.
 * @returns {{x: number, y: number}} O ponto P(t) na curva.
 */
function deCasteljau(p0, p1, p2, t) {
    const oneMinusT = 1 - t;
    
    // Interpolação linear entre p0 e p1
    const q0x = oneMinusT * p0.x + t * p1.x;
    const q0y = oneMinusT * p0.y + t * p1.y;

    // Interpolação linear entre p1 e p2
    const q1x = oneMinusT * p1.x + t * p2.x;
    const q1y = oneMinusT * p1.y + t * p2.y;

    // Interpolação final entre os pontos intermediários
    const x = oneMinusT * q0x + t * q1x;
    const y = oneMinusT * q0y + t * q1y;
    
    return { x: Math.round(x), y: Math.round(y) };
}


/**
 * Desenha uma Curva de Bézier na tela.
 * @param {object} graphics - A instância da classe GraphicsCanvas.
 * @param {{x: number, y: number}} p0 - Ponto de controle 0.
 * @param {{x: number, y: number}} p1 - Ponto de controle 1.
 * @param {{x: number, y: number}} p2 - Ponto de controle 2.
 * @param {string} color - A cor para desenhar a curva.
 */
export function drawBezierCurve(graphics, p0, p1, p2, color) {
    const points = [];
    const step = 0.01; // Define a precisão da curva. Menor = mais suave.

    // 1. Gerar uma lista de pontos ao longo da curva.
    for (let t = 0; t <= 1; t += step) {
        points.push(deCasteljau(p0, p1, p2, t));
    }
    // Garante que o último ponto seja exatamente p2.
    points.push(p2);

    // 2. Desenhar uma polilinha conectando os pontos gerados com Bresenham.
    for (let i = 0; i < points.length - 1; i++) {
        const startPoint = points[i];
        const endPoint = points[i + 1];

        // Evita desenhar segmentos de tamanho zero.
        if (startPoint.x !== endPoint.x || startPoint.y !== endPoint.y) {
            bresenhamLine(graphics, startPoint.x, startPoint.y, endPoint.x, endPoint.y, color);
        }
    }
}