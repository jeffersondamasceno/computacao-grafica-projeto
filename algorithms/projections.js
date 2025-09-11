// Algoritmos de Projeções 3D
// Implementação para projeções ortogonal, perspectiva, cavalier e cabinet

export class Projections {

    /**
     * Projeção ortogonal
     * @param {Array} points3D - Array de pontos 3D {x, y, z}
     * @param {number} theta - Ângulo de rotação em torno do eixo Y (graus)
     * @param {number} phi - Ângulo de rotação em torno do eixo X (graus)
     * @returns {Array} Array de pontos 2D {x, y} projetados
     */
    static orthographic(points3D, theta, phi) {
        const thetaRad = this.degreesToRadians(theta);
        const phiRad = this.degreesToRadians(phi);
        
        return points3D.map(p => {
            // Rotaciona em torno de Y e depois em X
            let pRotated = this.rotateY(p.x, p.y, p.z, thetaRad);
            pRotated = this.rotateX(pRotated.x, pRotated.y, pRotated.z, phiRad);
            
            // Projeta no plano z=0 (descarta a coordenada z)
            return { x: pRotated.x, y: pRotated.y };
        });
    }

    /**
     * Projeção perspectiva
     * @param {Array} points3D - Array de pontos 3D {x, y, z}
     * @param {number} d - Distância do observador ao plano de projeção
     * @param {number} theta - Ângulo de rotação em torno do eixo Y (graus)
     * @param {number} phi - Ângulo de rotação em torno do eixo X (graus)
     * @returns {Array} Array de pontos 2D {x, y} projetados
     */
    static perspective(points3D, d, theta, phi) {
        const thetaRad = this.degreesToRadians(theta);
        const phiRad = this.degreesToRadians(phi);
        
        return points3D.map(p => {
            // Rotaciona os pontos
            let pRotated = this.rotateY(p.x, p.y, p.z, thetaRad);
            pRotated = this.rotateX(pRotated.x, pRotated.y, pRotated.z, phiRad);

            // Aplica a projeção perspectiva
            // O fator de escala é d / (d + z')
            const factor = d / (d + pRotated.z);
            
            // Se o ponto estiver atrás do observador, não projeta
            if ((d + pRotated.z) <= 0) {
                 return { x: NaN, y: NaN }; // Ponto inválido
            }

            return {
                x: pRotated.x * factor,
                y: pRotated.y * factor
            };
        }).filter(p => !isNaN(p.x)); // Remove pontos inválidos
    }

    /**
     * Projeção cavalier (oblíqua)
     * @param {Array} points3D - Array de pontos 3D {x, y, z}
     * @param {number} alpha - Ângulo de projeção (graus)
     * @returns {Array} Array de pontos 2D {x, y} projetados
     */
    static cavalier(points3D, alpha) {
        const alphaRad = this.degreesToRadians(alpha);
        
        return points3D.map(p => {
            return {
                x: p.x + p.z * Math.cos(alphaRad),
                y: p.y + p.z * Math.sin(alphaRad)
            };
        });
    }

    /**
     * Projeção cabinet (oblíqua)
     * @param {Array} points3D - Array de pontos 3D {x, y, z}
     * @param {number} alpha - Ângulo de projeção (graus)
     * @returns {Array} Array de pontos 2D {x, y} projetados
     */
    static cabinet(points3D, alpha) {
        const alphaRad = this.degreesToRadians(alpha);
        
        return points3D.map(p => {
            return {
                x: p.x + 0.5 * p.z * Math.cos(alphaRad),
                y: p.y + 0.5 * p.z * Math.sin(alphaRad)
            };
        });
    }

    /**
     * Converte graus para radianos
     * @param {number} degrees - Ângulo em graus
     * @returns {number} Ângulo em radianos
     */
    static degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Rotaciona um ponto 3D em torno do eixo Y
     * @param {number} x - Coordenada x
     * @param {number} y - Coordenada y
     * @param {number} z - Coordenada z
     * @param {number} theta - Ângulo de rotação em radianos
     * @returns {Object} Ponto rotacionado {x, y, z}
     */
    static rotateY(x, y, z, theta) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        return {
            x: x * cosTheta + z * sinTheta,
            y: y,
            z: -x * sinTheta + z * cosTheta
        };
    }

    /**
     * Rotaciona um ponto 3D em torno do eixo X
     * @param {number} x - Coordenada x
     * @param {number} y - Coordenada y
     * @param {number} z - Coordenada z
     * @param {number} phi - Ângulo de rotação em radianos
     * @returns {Object} Ponto rotacionado {x, y, z}
     */
    static rotateX(x, y, z, phi) {
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        return {
            x: x,
            y: y * cosPhi - z * sinPhi,
            z: y * sinPhi + z * cosPhi
        };
    }
}