// Funções Auxiliares (definidas antes da classe para garantir que estejam disponíveis)

/**
 * Converte uma cor hexadecimal (#RRGGBB) para um objeto RGBA.
 * @param {string} hex - A string da cor hexadecimal.
 * @returns {{r: number, g: number, b: number, a: number}|null} Objeto RGBA ou nulo se inválido.
 */
function hexToRgb(hex) {
    if (!hex) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255 // Adiciona o canal alfa como totalmente opaco
    } : null;
}

/**
 * Compara dois objetos de cor (RGBA).
 * @param {{r,g,b,a}} color1 - Primeira cor.
 * @param {{r,g,b,a}} color2 - Segunda cor.
 * @returns {boolean} Verdadeiro se as cores forem iguais.
 */
function areColorsEqual(color1, color2) {
    if (!color1 || !color2) return false;
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a;
}


// Algoritmos de Preenchimento
// Implementação para preenchimento recursivo e por varredura

export class Fill {
    /**
     * Preenchimento iterativo (flood fill) usando uma pilha.
     * Esta função não desenha, ela retorna um array de pontos a serem preenchidos.
     * @param {number} x - Coordenada x do ponto de semente.
     * @param {number} y - Coordenada y do ponto de semente.
     * @param {string} fillColor - Cor de preenchimento no formato '#RRGGBB'.
     * @param {object} graphics - Instância da classe GraphicsCanvas.
     * @returns {Array<object>} Um array de pontos {x, y} para preencher.
     */
    static floodFill(x, y, fillColor, graphics) {
        const pointsToFill = [];
        const targetColor = graphics.getPixelColor(x, y);
        const fillColorRgb = hexToRgb(fillColor);
        
        // Se a cor do pixel clicado já for a cor de preenchimento, ou se alguma cor for inválida, não faz nada.
        if (!targetColor || !fillColorRgb || areColorsEqual(targetColor, fillColorRgb)) {
            return pointsToFill; // Retorna array vazio
        }

        const stack = [{ x, y }];
        const visited = new Set(); // Para evitar processar o mesmo pixel várias vezes
        
        while (stack.length > 0) {
            const node = stack.pop();
            const currentX = node.x;
            const currentY = node.y;
            const key = `${currentX},${currentY}`;

            // Valida se a coordenada está dentro dos limites e não foi visitada
            if (!graphics.validateCoordinates(currentX, currentY) || visited.has(key)) {
                continue;
            }

            const currentColor = graphics.getPixelColor(currentX, currentY);

            if (currentColor && areColorsEqual(currentColor, targetColor)) {
                pointsToFill.push({ x: currentX, y: currentY });
                visited.add(key);
                
                // Empilha os vizinhos
                stack.push({ x: currentX + 1, y: currentY });
                stack.push({ x: currentX - 1, y: currentY });
                stack.push({ x: currentX, y: currentY + 1 });
                stack.push({ x: currentX, y: currentY - 1 });
            }
        }
        return pointsToFill;
    }


    /**
     * Preenchimento por varredura (scanline fill).
     * @param {Array} polygonPoints - Array de pontos {x, y} do polígono.
     * @param {string} fillColor - Cor de preenchimento.
     * @param {object} graphics - Instância da classe GraphicsCanvas para desenhar.
     */
    static scanlineFill(polygonPoints, fillColor, graphics) {
        if (!polygonPoints || polygonPoints.length < 3) {
            console.error("O preenchimento por varredura requer um polígono com pelo menos 3 vértices.");
            return;
        }

        let minY = Infinity;
        let maxY = -Infinity;

        // Encontra os limites Y do polígono
        for (const p of polygonPoints) {
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        }

        // Itera por cada linha de varredura (scanline)
        for (let y = minY; y <= maxY; y++) {
            const intersections = [];
            // Encontra as interseções da scanline atual com as arestas do polígono
            for (let i = 0; i < polygonPoints.length; i++) {
                const p1 = polygonPoints[i];
                const p2 = polygonPoints[(i + 1) % polygonPoints.length]; // A próxima aresta, fechando o polígono

                // Garante que p1.y < p2.y para consistência
                const start = p1.y < p2.y ? p1 : p2;
                const end = p1.y < p2.y ? p2 : p1;

                // Verifica se a scanline cruza a aresta (e não é horizontal)
                if (y >= start.y && y < end.y) {
                     // Calcula a coordenada X da interseção (usando a equação da reta)
                    const x = (y - start.y) * (end.x - start.x) / (end.y - start.y) + start.x;
                    intersections.push(x);
                }
            }
            
            // Ordena as interseções em ordem crescente de X
            intersections.sort((a, b) => a - b);

            // Preenche os pixels entre pares de interseções (regra par-ímpar)
            for (let i = 0; i < intersections.length; i += 2) {
                // Garante que o par de interseção é válido
                if (intersections[i+1] !== undefined) {
                    const xStart = Math.ceil(intersections[i]);
                    const xEnd = Math.floor(intersections[i + 1]);
                    for (let x = xStart; x < xEnd; x++) {
                        graphics.drawPixel(x, y, fillColor);
                    }
                }
            }
        }
    }
}