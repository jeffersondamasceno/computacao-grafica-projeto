/**
 * @file Contém a lógica para transformações geométricas 2D (Translação, Rotação, Escala)
 * usando matrizes e coordenadas homogêneas.
 */

export class Transformations {

    /**
     * Multiplica uma matriz de transformação 3x3 por um vetor de ponto 3x1 [x, y, 1].
     * @param {number[][]} matrix - A matriz de transformação 3x3.
     * @param {number[]} point - O vetor do ponto em coordenadas homogêneas [x, y, 1].
     * @returns {number[]} O novo vetor do ponto transformado.
     */
    static multiplyMatrix(matrix, point) {
        const [x, y, w] = point;
        const result = [
            matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * w,
            matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * w,
            matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * w
        ];
        return result;
    }

    /**
     * Aplica uma translação a um conjunto de pontos.
     * @param {Array<{x: number, y: number}>} points - A lista de pontos da forma.
     * @param {number} tx - O deslocamento no eixo X.
     * @param {number} ty - O deslocamento no eixo Y.
     * @returns {Array<{x: number, y: number}>} A nova lista de pontos transladados.
     */
    static translate(points, tx, ty) {
        const translationMatrix = [
            [1, 0, tx],
            [0, 1, ty],
            [0, 0, 1]
        ];

        return points.map(p => {
            const pointVector = [p.x, p.y, 1];
            const [newX, newY] = this.multiplyMatrix(translationMatrix, pointVector);
            return { x: newX, y: newY };
        });
    }

    /**
     * Aplica uma escala a um conjunto de pontos em relação a um ponto pivô.
     * @param {Array<{x: number, y: number}>} points - A lista de pontos da forma.
     * @param {number} sx - O fator de escala no eixo X.
     * @param {number} sy - O fator de escala no eixo Y.
     * @param {{x: number, y: number}} pivot - O ponto pivô para a escala.
     * @returns {Array<{x: number, y: number}>} A nova lista de pontos escalados.
     */
    static scale(points, sx, sy, pivot) {
        return points.map(p => {
            // 1. Translada o ponto para a origem (baseado no pivô)
            let tempX = p.x - pivot.x;
            let tempY = p.y - pivot.y;

            // 2. Aplica a escala
            tempX *= sx;
            tempY *= sy;

            // 3. Translada o ponto de volta para a posição original
            const finalX = tempX + pivot.x;
            const finalY = tempY + pivot.y;

            return { x: Math.round(finalX), y: Math.round(finalY) };
        });
    }

    /**
     * Aplica uma rotação a um conjunto de pontos em relação a um ponto pivô.
     * @param {Array<{x: number, y: number}>} points - A lista de pontos da forma.
     * @param {number} angleDegrees - O ângulo de rotação em graus.
     * @param {{x: number, y: number}} pivot - O ponto pivô para a rotação.
     * @returns {Array<{x: number, y: number}>} A nova lista de pontos rotacionados.
     */
    static rotate(points, angleDegrees, pivot) {
        // Converte o ângulo de graus para radianos
        const angleRad = angleDegrees * (Math.PI / 180);
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);

        return points.map(p => {
            // 1. Translada o ponto para a origem (baseado no pivô)
            const tempX = p.x - pivot.x;
            const tempY = p.y - pivot.y;

            // 2. Aplica a rotação usando a matriz de rotação
            const rotatedX = tempX * cosA - tempY * sinA;
            const rotatedY = tempX * sinA + tempY * cosA;

            // 3. Translada o ponto de volta para a posição original
            const finalX = rotatedX + pivot.x;
            const finalY = rotatedY + pivot.y;

            return { x: Math.round(finalX), y: Math.round(finalY) };
        });
    }
}