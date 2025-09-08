/**
 * ALGORITMO DO PONTO MÉDIO PARA CÍRCULOS
 * Exporta a função para que possa ser usada em outros arquivos (como o main.js).
 * @param {object} graphics - A instância da classe GraphicsCanvas, para ter acesso a métodos como drawPixel.
 * @param {number} centerX - Coordenada X do centro do círculo na malha.
 * @param {number} centerY - Coordenada Y do centro.
 * @param {number} radius - O raio do círculo em unidades da malha.
 * @param {string} color - A cor para desenhar o círculo.
 */
export function midpointCircle(graphics, centerX, centerY, radius, color) {
    let x = 0;
    let y = radius;
    let p = 1 - radius; // Parâmetro de decisão inicial.

    // Função auxiliar para desenhar os 8 pontos simétricos de uma vez.
    const drawCirclePoints = (cx, cy, x, y, c) => {
        graphics.drawPixel(cx + x, cy + y, c);
        graphics.drawPixel(cx - x, cy + y, c);
        graphics.drawPixel(cx + x, cy - y, c);
        graphics.drawPixel(cx - x, cy - y, c);
        graphics.drawPixel(cx + y, cy + x, c);
        graphics.drawPixel(cx - y, cy + x, c);
        graphics.drawPixel(cx + y, cy - x, c);
        graphics.drawPixel(cx - y, cy - x, c);
    };

    // Desenha o primeiro conjunto de pontos.
    drawCirclePoints(centerX, centerY, x, y, color);

    // Loop para calcular os pontos do primeiro octante e espelhar para os outros.
    while (x < y) {
        x++;
        if (p < 0) {
            p += 2 * x + 1;
        } else {
            y--;
            p += 2 * (x - y) + 1;
        }
        drawCirclePoints(centerX, centerY, x, y, color);
    }
}