// Protótipo de Computação Gráfica - JavaScript Principal
// Implementa malha quadriculada e estrutura base para algoritmos

class GraphicsCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20; // Tamanho da malha em pixels
        this.showGrid = true;
        this.drawColor = '#ff0000';
        this.lineWidth = 1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.drawGrid();
        this.updateCoordinatesDisplay();
    }

    setupEventListeners() {
        // Eventos do mouse para coordenadas
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Eventos dos botões de controle
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('toggleGrid').addEventListener('click', () => this.toggleGrid());
        
        // Eventos dos algoritmos
        document.getElementById('drawLine').addEventListener('click', () => this.drawLine());
        document.getElementById('drawCircle').addEventListener('click', () => this.drawCircle());
        document.getElementById('drawEllipse').addEventListener('click', () => this.drawEllipse());
        document.getElementById('drawBezier').addEventListener('click', () => this.drawBezier());
        document.getElementById('drawPolyline').addEventListener('click', () => this.drawPolyline());
        document.getElementById('fillArea').addEventListener('click', () => this.fillArea());
        document.getElementById('applyTransform').addEventListener('click', () => this.applyTransform());
        document.getElementById('applyProjection').addEventListener('click', () => this.applyProjection());
        
        // Eventos de configuração
        document.getElementById('drawColor').addEventListener('change', (e) => {
            this.drawColor = e.target.value;
        });
        
        document.getElementById('lineWidth').addEventListener('input', (e) => {
            this.lineWidth = parseInt(e.target.value);
        });
    }

    // Desenha a malha quadriculada
    drawGrid() {
        if (!this.showGrid) return;
        
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        
        // Linhas verticais
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Linhas horizontais
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Eixos coordenados (mais escuros)
        this.ctx.strokeStyle = '#999999';
        this.ctx.lineWidth = 1;
        
        // Eixo X (linha horizontal central)
        const centerY = Math.floor(this.canvas.height / 2 / this.gridSize) * this.gridSize;
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        this.ctx.lineTo(this.canvas.width, centerY);
        this.ctx.stroke();
        
        // Eixo Y (linha vertical central)
        const centerX = Math.floor(this.canvas.width / 2 / this.gridSize) * this.gridSize;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, this.canvas.height);
        this.ctx.stroke();
        
        // Números das coordenadas
        this.drawCoordinateNumbers();
    }

    // Desenha números das coordenadas na malha
    drawCoordinateNumbers() {
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        
        // Números no eixo X
        for (let x = this.gridSize; x < this.canvas.width; x += this.gridSize) {
            const coordX = Math.round((x - this.canvas.width / 2) / this.gridSize);
            this.ctx.fillText(coordX.toString(), x, this.canvas.height / 2 - 5);
        }
        
        // Números no eixo Y
        this.ctx.textAlign = 'right';
        for (let y = this.gridSize; y < this.canvas.height; y += this.gridSize) {
            const coordY = Math.round((this.canvas.height / 2 - y) / this.gridSize);
            this.ctx.fillText(coordY.toString(), this.canvas.width / 2 - 5, y);
        }
    }

    // Converte coordenadas da tela para coordenadas da malha
    screenToGrid(screenX, screenY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const gridX = Math.round((screenX - centerX) / this.gridSize);
        const gridY = Math.round((centerY - screenY) / this.gridSize);
        
        return { x: gridX, y: gridY };
    }

    // Converte coordenadas da malha para coordenadas da tela
    gridToScreen(gridX, gridY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const screenX = centerX + gridX * this.gridSize;
        const screenY = centerY - gridY * this.gridSize;
        
        return { x: screenX, y: screenY };
    }

    // Desenha um pixel na malha
    drawPixel(gridX, gridY, color = null) {
        const screenPos = this.gridToScreen(gridX, gridY);
        const pixelSize = this.gridSize;
        
        this.ctx.fillStyle = color || this.drawColor;
        this.ctx.fillRect(
            screenPos.x - pixelSize / 2,
            screenPos.y - pixelSize / 2,
            pixelSize,
            pixelSize
        );
    }

    // Desenha uma linha entre dois pontos da malha
    drawLineBetweenPoints(gridX1, gridY1, gridX2, gridY2) {
        const screenPos1 = this.gridToScreen(gridX1, gridY1);
        const screenPos2 = this.gridToScreen(gridX2, gridY2);
        
        this.ctx.strokeStyle = this.drawColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(screenPos1.x, screenPos1.y);
        this.ctx.lineTo(screenPos2.x, screenPos2.y);
        this.ctx.stroke();
    }

    // Limpa o canvas e redesenha a malha
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
    }

    // Alterna a exibição da malha
    toggleGrid() {
        this.showGrid = !this.showGrid;
        if (this.showGrid) {
            this.drawGrid();
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // Atualiza o display de coordenadas
    updateCoordinatesDisplay() {
        const display = document.getElementById('coordinatesDisplay');
        if (display) {
            display.textContent = 'Clique no canvas para ver coordenadas';
        }
    }

    // Manipula movimento do mouse
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const gridCoords = this.screenToGrid(x, y);
        const display = document.getElementById('coordinatesDisplay');
        
        if (display) {
            display.textContent = `Coordenadas: (${gridCoords.x}, ${gridCoords.y})`;
        }
    }

    // Manipula clique no canvas
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const gridCoords = this.screenToGrid(x, y);
        console.log(`Clique em coordenadas da malha: (${gridCoords.x}, ${gridCoords.y})`);
    }

    // ===== IMPLEMENTAÇÕES DOS ALGORITMOS =====
    
    // Algoritmo de Bresenham para linhas
    drawLine() {
        const x1 = parseInt(document.getElementById('x1').value);
        const y1 = parseInt(document.getElementById('y1').value);
        const x2 = parseInt(document.getElementById('x2').value);
        const y2 = parseInt(document.getElementById('y2').value);
        
        console.log(`Desenhando linha de (${x1}, ${y1}) para (${x2}, ${y2})`);
        
        // Detecta automaticamente se a entrada está em pixels de tela (origem no topo-esquerda)
        // ou em coordenadas da malha (origem no centro). Se valores forem grandes como pixels,
        // converte para coordenadas da malha.
        const maxGridX = Math.floor(this.canvas.width / this.gridSize);
        const maxGridY = Math.floor(this.canvas.height / this.gridSize);
        const looksLikeScreenCoords = (v) => Math.abs(v) > Math.max(maxGridX, maxGridY);

        let gx1 = x1, gy1 = y1, gx2 = x2, gy2 = y2;
        if (looksLikeScreenCoords(x1) || looksLikeScreenCoords(y1) || looksLikeScreenCoords(x2) || looksLikeScreenCoords(y2)) {
            const p1 = this.screenToGrid(x1, y1);
            const p2 = this.screenToGrid(x2, y2);
            gx1 = p1.x; gy1 = p1.y; gx2 = p2.x; gy2 = p2.y;
        }

        this.bresenhamLine(gx1, gy1, gx2, gy2);
    }

    // Implementação do algoritmo de Bresenham para todas as inclinações
    bresenhamLine(x0, y0, x1, y1) {
        // Usa a implementação do arquivo bresenham.js
        Bresenham.drawLine(x0, y0, x1, y1, (x, y) => this.drawPixel(x, y));
    }

    // Algoritmo de círculo por ponto médio
    drawCircle() {
        const centerX = parseInt(document.getElementById('circleX').value);
        const centerY = parseInt(document.getElementById('circleY').value);
        const radius = parseInt(document.getElementById('circleRadius').value);
        
        console.log(`Desenhando círculo no centro (${centerX}, ${centerY}) com raio ${radius}`);
        
        // TODO: Implementar algoritmo de círculo por ponto médio
        // Por enquanto, desenha um círculo simples
        const screenPos = this.gridToScreen(centerX, centerY);
        const screenRadius = radius * this.gridSize;
        
        this.ctx.strokeStyle = this.drawColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    // Algoritmo de elipse
    drawEllipse() {
        const centerX = parseInt(document.getElementById('ellipseX').value);
        const centerY = parseInt(document.getElementById('ellipseY').value);
        const a = parseInt(document.getElementById('ellipseA').value);
        const b = parseInt(document.getElementById('ellipseB').value);
        
        console.log(`Desenhando elipse no centro (${centerX}, ${centerY}) com semi-eixos a=${a}, b=${b}`);
        
        // TODO: Implementar algoritmo de elipse
        // Por enquanto, desenha uma elipse simples
        const screenPos = this.gridToScreen(centerX, centerY);
        const screenA = a * this.gridSize;
        const screenB = b * this.gridSize;
        
        this.ctx.strokeStyle = this.drawColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        this.ctx.ellipse(screenPos.x, screenPos.y, screenA, screenB, 0, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    // Curvas de Bézier
    drawBezier() {
        const p0x = parseInt(document.getElementById('bezierP0x').value);
        const p0y = parseInt(document.getElementById('bezierP0y').value);
        const p1x = parseInt(document.getElementById('bezierP1x').value);
        const p1y = parseInt(document.getElementById('bezierP1y').value);
        const p2x = parseInt(document.getElementById('bezierP2x').value);
        const p2y = parseInt(document.getElementById('bezierP2y').value);
        
        console.log(`Desenhando curva de Bézier com pontos P0(${p0x}, ${p0y}), P1(${p1x}, ${p1y}), P2(${p2x}, ${p2y})`);
        
        // TODO: Implementar algoritmo de Bézier
        // Por enquanto, desenha uma curva simples
        const screenP0 = this.gridToScreen(p0x, p0y);
        const screenP1 = this.gridToScreen(p1x, p1y);
        const screenP2 = this.gridToScreen(p2x, p2y);
        
        this.ctx.strokeStyle = this.drawColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(screenP0.x, screenP0.y);
        this.ctx.quadraticCurveTo(screenP1.x, screenP1.y, screenP2.x, screenP2.y);
        this.ctx.stroke();
    }

    // Polilinha
    drawPolyline() {
        const pointsText = document.getElementById('polylinePoints').value;
        const points = pointsText.split(',').map(p => p.trim());
        
        if (points.length < 4 || points.length % 2 !== 0) {
            alert('Digite pontos válidos no formato: x1,y1, x2,y2, x3,y3...');
            return;
        }
        
        console.log('Desenhando polilinha com pontos:', points);
        
        // TODO: Implementar algoritmo de polilinha
        // Por enquanto, desenha uma polilinha simples
        this.ctx.strokeStyle = this.drawColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        
        for (let i = 0; i < points.length; i += 2) {
            const x = parseInt(points[i]);
            const y = parseInt(points[i + 1]);
            const screenPos = this.gridToScreen(x, y);
            
            if (i === 0) {
                this.ctx.moveTo(screenPos.x, screenPos.y);
            } else {
                this.ctx.lineTo(screenPos.x, screenPos.y);
            }
        }
        
        this.ctx.stroke();
    }

    // Preenchimento de área
    fillArea() {
        const seedX = parseInt(document.getElementById('seedX').value);
        const seedY = parseInt(document.getElementById('seedY').value);
        const algorithm = document.getElementById('fillAlgorithm').value;
        
        console.log(`Preenchendo área a partir do ponto (${seedX}, ${seedY}) usando algoritmo ${algorithm}`);
        
        // TODO: Implementar algoritmos de preenchimento
        alert('Algoritmo de preenchimento será implementado em breve!');
    }

    // Transformações
    applyTransform() {
        const type = document.getElementById('transformType').value;
        const param1 = parseFloat(document.getElementById('transformParam1').value);
        const param2 = parseFloat(document.getElementById('transformParam2').value);
        
        console.log(`Aplicando transformação ${type} com parâmetros ${param1}, ${param2}`);
        
        // TODO: Implementar transformações
        alert('Transformações serão implementadas em breve!');
    }

    // Projeções 3D
    applyProjection() {
        const type = document.getElementById('projectionType').value;
        const angle1 = parseFloat(document.getElementById('projectionAngle1').value);
        const angle2 = parseFloat(document.getElementById('projectionAngle2').value);
        
        console.log(`Aplicando projeção ${type} com ângulos ${angle1}°, ${angle2}°`);
        
        // TODO: Implementar projeções 3D
        alert('Projeções 3D serão implementadas em breve!');
    }
}

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando protótipo de Computação Gráfica...');
    
    // Cria a instância do canvas gráfico
    const graphicsCanvas = new GraphicsCanvas('drawingCanvas');
    
    // Exibe informações de debug
    console.log('Canvas inicializado com sucesso!');
    console.log('Funcionalidades disponíveis:');
    console.log('- Malha quadriculada com coordenadas');
    console.log('- Interface para todos os algoritmos');
    console.log('- Sistema de coordenadas da malha');
    console.log('- Controles de cor e espessura');
    console.log('- Estrutura base para implementação dos algoritmos');
});
