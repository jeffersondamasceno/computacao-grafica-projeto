/**
 * @file Contém a implementação do Algoritmo do Ponto Médio para Elipses.
 */

/**
 * Desenha uma elipse usando o Algoritmo do Ponto Médio.
 * O algoritmo é dividido em duas regiões para otimizar o cálculo dos pixels.
 * @param {object} graphics - A instância da classe GraphicsCanvas para acesso ao método drawPixel.
 * @param {number} centerX - Coordenada X do centro da elipse.
 * @param {number} centerY - Coordenada Y do centro.
 * @param {number} radiusX - O raio no eixo X (semi-eixo maior).
 * @param {number} radiusY - O raio no eixo Y (semi-eixo menor).
 * @param {string} color - A cor para desenhar a elipse.
 */
export function midpointEllipse(graphics, centerX, centerY, radiusX, radiusY, color) {
    let rx2 = radiusX * radiusX;
    let ry2 = radiusY * radiusY;
    let twoRx2 = 2 * rx2;
    let twoRy2 = 2 * ry2;
    let p;
    let x = 0;
    let y = radiusY;
    let px = 0;
    let py = twoRx2 * y;

    // Função auxiliar para desenhar os 4 pontos simétricos
    const drawEllipsePoints = (x, y) => {
        graphics.drawPixel(centerX + x, centerY + y, color);
        graphics.drawPixel(centerX - x, centerY + y, color);
        graphics.drawPixel(centerX + x, centerY - y, color);
        graphics.drawPixel(centerX - x, centerY - y, color);
    };

    // --- Desenha os pontos iniciais nos eixos ---
    drawEllipsePoints(x, y);

    // --- Região 1 ---
    // Começa em (0, ry) e vai até o ponto onde a inclinação da curva é -1.
    p = Math.round(ry2 - (rx2 * radiusY) + (0.25 * rx2));
    while (px < py) {
        x++;
        px += twoRy2;
        if (p < 0) {
            p += ry2 + px;
        } else {
            y--;
            py -= twoRx2;
            p += ry2 + px - py;
        }
        drawEllipsePoints(x, y);
    }

    // --- Região 2 ---
    // Começa onde a Região 1 parou e continua até o eixo X.
    p = Math.round(ry2 * (x + 0.5) * (x + 0.5) + rx2 * (y - 1) * (y - 1) - rx2 * ry2);
    while (y > 0) {
        y--;
        py -= twoRx2;
        if (p > 0) {
            p += rx2 - py;
        } else {
            x++;
            px += twoRy2;
            p += rx2 - py + px;
        }
        drawEllipsePoints(x, y);
    }
}