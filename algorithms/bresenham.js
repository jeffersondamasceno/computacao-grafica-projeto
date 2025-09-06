/**
 * ALGORITMO DE BRESENHAM PARA LINHAS
 * Desenha uma linha usando o algoritmo de Bresenham para todas as inclinações.
 * @param {object} graphics - A instância da classe GraphicsCanvas para acesso ao método drawPixel.
 * @param {number} x0 - Coordenada x do ponto inicial.
 * @param {number} y0 - Coordenada y do ponto inicial.
 * @param {number} x1 - Coordenada x do ponto final.
 * @param {number} y1 - Coordenada y do ponto final.
 */
export function bresenhamLine(graphics, x0, y0, x1, y1) {
    const drawPixel = (x, y) => graphics.drawPixel(x, y);

    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;

    let err = dx - dy;

    while (true) {
        drawPixel(x0, y0);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
}