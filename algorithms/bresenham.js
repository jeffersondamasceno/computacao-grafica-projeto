// Algoritmo de Bresenham para desenho de linhas
// Implementação completa para todas as inclinações

class Bresenham {
    /**
     * Desenha uma linha usando o algoritmo de Bresenham
     * @param {number} x0 - Coordenada x do ponto inicial
     * @param {number} y0 - Coordenada y do ponto inicial
     * @param {number} x1 - Coordenada x do ponto final
     * @param {number} y1 - Coordenada y do ponto final
     * @param {Function} drawPixel - Função para desenhar um pixel (x, y)
     */
    static drawLine(x0, y0, x1, y1, drawPixel) {
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
            if (e2 <  dx) { err += dx; y0 += sy; }
        }
    }

    /**
     * Calcula os pontos de uma linha usando o algoritmo de Bresenham
     * @param {number} x0 - Coordenada x do ponto inicial
     * @param {number} y0 - Coordenada y do ponto inicial
     * @param {number} x1 - Coordenada x do ponto final
     * @param {number} y1 - Coordenada y do ponto final
     * @returns {Array} Array de pontos {x, y} da linha
     */
    static getLinePoints(x0, y0, x1, y1) {
        const points = [];
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;

        let err = dx - dy;

        while (true) {
            points.push({ x: x0, y: y0 });
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 <  dx) { err += dx; y0 += sy; }
        }

        return points;
    }
}

// Exporta a classe para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Bresenham;
}
