/**
 * @file Arquivo principal (entry point) da aplicação de Computação Gráfica.
 * - Gerencia a classe principal GraphicsCanvas.
 * - Importa e utiliza os módulos de algoritmos.
 * - Inicializa a aplicação quando o HTML é carregado.
 */

// Importa os algoritmos dos arquivos separados para que possamos usá-los aqui.
import { bresenhamLine } from './algorithms/bresenham.js';
import { midpointCircle } from './algorithms/midpointCircle.js';
import { midpointEllipse } from './algorithms/ellipse.js';
import { drawBezierCurve } from './algorithms/bezier.js';
import { Polyline } from './algorithms/polyline.js';
import { Fill } from './algorithms/fill.js';
import { Transformations } from './algorithms/transformations.js';

/**
 * @class GraphicsCanvas
 * @description Classe principal que encapsula toda a lógica e estado do canvas,
 * incluindo a renderização da malha, manipulação de eventos e chamada dos algoritmos.
 */
class GraphicsCanvas {
    /**
     * Construtor da classe. É chamado uma única vez quando a aplicação inicia.
     * @param {string} canvasId - O ID do elemento <canvas> no HTML.
     */
    constructor(canvasId) {
        // --- 1. INICIALIZAÇÃO DO CANVAS E CONTEXTO ---
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true }); // Habilita leitura de pixels

        // --- 2. CONFIGURAÇÕES DO AMBIENTE ---
        this.gridSize = 20; // Tamanho de cada célula da malha em pixels (fixo e confortável)
        this.showGrid = true; // Controla a visibilidade da malha
        
        // Configurações da grade (limites do sistema de coordenadas)
        this.gridWidth = 40; // Largura da grade em unidades (X)
        this.gridHeight = 30; // Altura da grade em unidades (Y)
        
        // Sistema de scroll
        this.scrollContainer = null; // Referência ao container de scroll
        this.scrollX = 0; // Posição de scroll horizontal
        this.scrollY = 0; // Posição de scroll vertical
        
        // Sistema de zoom
        this.zoomLevel = 1.0; // Nível de zoom (1.0 = 100%)
        this.minZoom = 0.25; // Zoom mínimo (25%)
        this.maxZoom = 4.0; // Zoom máximo (400%)
        this.zoomStep = 0.1; // Incremento/decremento do zoom
        this.baseGridSize = 20; // Tamanho base dos pixels (sem zoom)

        // --- 3. ESTADO DO DESENHO ---
        this.drawColor = '#ff0000'; // Cor padrão para novas formas
        this.lineWidth = 1; // Espessura padrão para linhas

        // Objeto que controla o estado de desenhos interativos (multi-cliques)
        this.drawingState = {
            mode: null,   // Ex: 'circle_center', 'circle_radius', 'polyline_draw'
            points: [],   // Armazena os pontos que o usuário clica
        };
        
        // Array para armazenar todos os desenhos feitos na grade
        this.savedDrawings = [];
        this.lastPolygon = null; // Armazena o último polígono desenhado
        
        // Inicia a configuração da aplicação
        this.init();
    }

    /**
     * Método de inicialização. Configura os event listeners e desenha o estado inicial do canvas.
     */
    init() {
        this.setupEventListeners();
        this.setupScrollSystem(); // Configura o sistema de scroll
        this.resizeCanvas(); // Redimensiona o canvas inicial
        this.updateInputLimits(); // Inicializa os limites dos inputs
        
        // Atualiza a informação visual do tamanho do pixel
        document.getElementById('currentPixelSize').textContent = this.gridSize;
        
        // Inicializa o sistema de zoom
        this.updateZoomInfo();
        
        this.redrawCanvas();
    }

    // =======================================================================
    // Seção: Configuração de Eventos
    // =======================================================================

    /**
     * Centraliza a configuração de todos os "ouvintes de eventos" da UI (botões, mouse, etc.).
     */
    setupEventListeners() {
        // Eventos do mouse diretamente no canvas
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleCanvasDblClick(e)); // Evento de clique duplo
        this.canvas.addEventListener('wheel', (e) => this.handleMouseWheel(e));

        // Eventos de botões de controle geral
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('toggleGrid').addEventListener('click', () => this.toggleGrid());
        
        // Eventos de zoom
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoomReset').addEventListener('click', () => this.zoomReset());

        // Eventos para acionar os algoritmos de desenho
        document.getElementById('drawLine').addEventListener('click', () => this.drawLineFromInput());
        document.getElementById('drawLineInteractive').addEventListener('click', () => this.startInteractiveLineDraw());

        document.getElementById('drawCircleFromInput').addEventListener('click', () => this.drawCircleFromInput());
        document.getElementById('drawCircleInteractive').addEventListener('click', () => this.startInteractiveCircleDraw());

        document.getElementById('drawEllipse').addEventListener('click', () => this.drawEllipseFromInput());
        document.getElementById('drawEllipseInteractive').addEventListener('click', () => this.startInteractiveEllipseDraw());

        document.getElementById('drawBezier').addEventListener('click', () => this.drawBezierFromInput());

        document.getElementById('drawPolyline').addEventListener('click', () => this.drawPolylineFromInput());
        document.getElementById('drawPolylineInteractive').addEventListener('click', () => this.startInteractivePolylineDraw());
        
        document.getElementById('fillArea').addEventListener('click', () => this.fillAreaFromInput());
        document.getElementById('fillAreaInteractive').addEventListener('click', () => this.startInteractiveFill());

        document.getElementById('applyTransform').addEventListener('click', () => this.applyTransform());
        document.getElementById('transformType').addEventListener('change', (e) => this.handleTransformTypeChange(e));

        // Eventos para as configurações de desenho (cor, espessura)
        document.getElementById('drawColor').addEventListener('change', (e) => { this.drawColor = e.target.value; });
        document.getElementById('lineWidth').addEventListener('input', (e) => { this.lineWidth = parseInt(e.target.value); });
        
        // Eventos para configuração da grade
        document.getElementById('gridWidth').addEventListener('input', (e) => {
            document.getElementById('gridWidthValue').textContent = e.target.value;
            this.previewGridSize(); // Mostra prévia do tamanho
        });
        document.getElementById('gridHeight').addEventListener('input', (e) => {
            document.getElementById('gridHeightValue').textContent = e.target.value;
            this.previewGridSize(); // Mostra prévia do tamanho
        });
        document.getElementById('applyGridSize').addEventListener('click', () => this.applyGridSize());
    }
    
    /** Configura o sistema de scroll para navegar pela grade. */
    setupScrollSystem() {
        this.scrollContainer = document.getElementById('canvasScrollContainer');
        
        // Event listener para detectar mudanças no scroll
        this.scrollContainer.addEventListener('scroll', () => {
            this.scrollX = this.scrollContainer.scrollLeft;
            this.scrollY = this.scrollContainer.scrollTop;
        });
        
        // Centraliza o scroll inicialmente
        this.centerScroll();
    }
    
    /** Centraliza o scroll na grade. */
    centerScroll() {
        if (!this.scrollContainer) return;
        
        // Calcula o tamanho total da grade em pixels
        const totalWidth = this.gridWidth * this.gridSize;
        const totalHeight = this.gridHeight * this.gridSize;
        
        // Calcula a posição central
        const centerX = (totalWidth - this.scrollContainer.clientWidth) / 2;
        const centerY = (totalHeight - this.scrollContainer.clientHeight) / 2;
        
        // Aplica o scroll centralizado
        this.scrollContainer.scrollLeft = Math.max(0, centerX);
        this.scrollContainer.scrollTop = Math.max(0, centerY);
    }
    
    /** Aplica zoom in. */
    zoomIn() {
        this.setZoom(this.zoomLevel + this.zoomStep);
    }
    
    /** Aplica zoom out. */
    zoomOut() {
        this.setZoom(this.zoomLevel - this.zoomStep);
    }
    
    /** Reseta o zoom para 100%. */
    zoomReset() {
        this.setZoom(1.0);
    }
    
    /** Define o nível de zoom com validação de limites. */
    setZoom(newZoomLevel) {
        // Valida os limites de zoom
        newZoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, newZoomLevel));
        
        if (newZoomLevel === this.zoomLevel) return; // Não faz nada se o zoom não mudou
        
        // Calcula o novo tamanho dos pixels
        this.zoomLevel = newZoomLevel;
        this.gridSize = Math.round(this.baseGridSize * this.zoomLevel);
        
        // Redimensiona o canvas
        this.resizeCanvas();
        
        // Redesenha a grade
        this.redrawCanvas();
        
        // Atualiza a interface
        this.updateZoomInfo();
        this.updateInputLimits();
    }
    
    /** Atualiza a informação de zoom na interface. */
    updateZoomInfo() {
        const zoomInfo = document.getElementById('zoomInfo');
        if (zoomInfo) {
            const percentage = Math.round(this.zoomLevel * 100);
            zoomInfo.textContent = `${percentage}%`;
        }
    }
    

    // =======================================================================
    // Seção: Renderização Principal e Malha
    // =======================================================================

    /**
     * Limpa e redesenha completamente o canvas. Útil para atualizações e pré-visualizações.
     */
    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.showGrid) {
            this.drawGrid();
        }
        // Redesenha todos os desenhos salvos
        this.redrawAllSavedDrawings();
    }
    
    /**
     * Redesenha todos os desenhos salvos no canvas.
     */
    redrawAllSavedDrawings() {
        this.savedDrawings.forEach(drawing => {
            this.drawSavedDrawing(drawing);
        });
    }
    
    /**
     * Desenha um desenho salvo no canvas.
     * @param {Object} drawing - Objeto contendo as informações do desenho
     */
    drawSavedDrawing(drawing) {
        if (drawing.type === 'line') {
            bresenhamLine(this, drawing.x1, drawing.y1, drawing.x2, drawing.y2, drawing.color);
        } else if (drawing.type === 'circle') {
            midpointCircle(this, drawing.centerX, drawing.centerY, drawing.radius, drawing.color);
        } else if (drawing.type === 'ellipse') {
            midpointEllipse(this, drawing.centerX, drawing.centerY, drawing.radiusX, drawing.radiusY, drawing.color);
        } else if (drawing.type === 'bezier') {
            drawBezierCurve(this, drawing.p0, drawing.p1, drawing.p2, drawing.color);
        } else if (drawing.type === 'polyline') {
            Polyline.drawPolyline(this, drawing.points, drawing.color);
        } else if (drawing.type === 'polygon') {
            Polyline.drawPolygon(this, drawing.points, drawing.color);
        } else if (drawing.type === 'fill') {
            drawing.points.forEach(p => {
                this.drawPixel(p.x, p.y, drawing.color);
            });
        }
    }
    
    /**
     * Salva um desenho no armazenamento de desenhos.
     * @param {Object} drawingData - Dados do desenho a ser salvo
     */
    saveDrawing(drawingData) {
        this.savedDrawings.push(drawingData);
    }

    /**
     * Desenha a malha quadriculada e os eixos cartesianos no canvas.
     */
    drawGrid() {
        if (!this.showGrid) return;
        
        this.ctx.strokeStyle = '#e0e0e0'; // Cor única para todas as linhas da grade
        this.ctx.lineWidth = 0.5; // Linhas finas para a grade

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const halfWidth = Math.floor(this.gridWidth / 2);
        const halfHeight = Math.floor(this.gridHeight / 2);
        
        // Linhas verticais
        for (let i = -halfWidth; i <= halfWidth; i++) {
            const x = centerX + i * this.gridSize;
            // Garante que a linha seja desenhada dentro dos limites do canvas para evitar erros.
            const screenX = Math.round(x) + 0.5; // Adiciona 0.5 para linhas mais nítidas
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, 0);
            this.ctx.lineTo(screenX, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Linhas horizontais
        for (let i = -halfHeight; i <= halfHeight; i++) {
            const y = centerY - i * this.gridSize;
            // Garante que a linha seja desenhada dentro dos limites
            const screenY = Math.round(y) + 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, screenY);
            this.ctx.lineTo(this.canvas.width, screenY);
            this.ctx.stroke();
        }

        this.drawCoordinateNumbers();
    }
    
    /**
     * Desenha os números das coordenadas ao longo dos eixos X e Y.
     */
    drawCoordinateNumbers() {
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const halfWidth = Math.floor(this.gridWidth / 2);
        const halfHeight = Math.floor(this.gridHeight / 2);
        
        // Números no eixo X
        for (let i = -halfWidth; i <= halfWidth; i++) {
            if (i !== 0) {
                const x = centerX + i * this.gridSize;
                this.ctx.fillText(i.toString(), x, centerY - 5);
            }
        }
        
        // Números no eixo Y
        this.ctx.textAlign = 'right';
        for (let i = -halfHeight; i <= halfHeight; i++) {
            if (i !== 0) {
                const y = centerY - i * this.gridSize;
                this.ctx.fillText(i.toString(), centerX - 5, y + 4);
            }
        }
    }

    // =======================================================================
    // Seção: Sistema de Coordenadas e Desenho de Pixel
    // =======================================================================

    /**
     * Converte coordenadas da tela (pixels, origem no topo-esquerdo) para o nosso sistema de malha (unidades, origem no centro).
     * @param {number} screenX - A coordenada X em pixels da tela.
     * @param {number} screenY - A coordenada Y em pixels da tela.
     * @returns {{x: number, y: number}} As coordenadas correspondentes na malha.
     */
    screenToGrid(screenX, screenY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        // A fórmula inverte o eixo Y para que ele cresça para cima.
        const gridX = Math.round((screenX - centerX) / this.gridSize);
        const gridY = Math.round((centerY - screenY) / this.gridSize);
        return { x: gridX, y: gridY };
    }

    /**
     * Converte coordenadas da nossa malha para as coordenadas de pixel da tela.
     * @param {number} gridX - A coordenada X na nossa malha.
     * @param {number} gridY - A coordenada Y na nossa malha.
     * @returns {{x: number, y: number}} As coordenadas em pixels na tela.
     */
    gridToScreen(gridX, gridY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const screenX = centerX + gridX * this.gridSize;
        const screenY = centerY - gridY * this.gridSize;
        return { x: screenX, y: screenY };
    }

    /**
     * Desenha um "pixel" na malha, que na verdade é um quadrado preenchido do tamanho de uma célula.
     * @param {number} gridX - A coordenada X da célula a ser pintada.
     * @param {number} gridY - A coordenada Y da célula a ser pintada.
     * @param {string} [color=null] - Uma cor opcional. Se não for fornecida, usa a cor padrão.
     */
    drawPixel(gridX, gridY, color = null) {
        // Valida se o pixel está dentro dos limites da grade
        if (!this.validateCoordinates(gridX, gridY)) {
            return; // Não desenha se estiver fora dos limites
        }
        
        const screenPos = this.gridToScreen(gridX, gridY);
        const pixelSize = this.gridSize;
        this.ctx.fillStyle = color || this.drawColor;
        // A posição é ajustada em metade do tamanho do pixel para centralizar o quadrado.
        this.ctx.fillRect(screenPos.x - pixelSize / 2, screenPos.y - pixelSize / 2, pixelSize, pixelSize);
    }
    
    /**
     * Obtém a cor de um pixel na grade.
     * @param {number} gridX - A coordenada X da célula.
     * @param {number} gridY - A coordenada Y da célula.
     * @returns {{r: number, g: number, b: number, a: number}|null} Objeto com a cor RGBA ou null se fora dos limites.
     */
    getPixelColor(gridX, gridY) {
        if (!this.validateCoordinates(gridX, gridY)) {
            return null;
        }
        const screenPos = this.gridToScreen(gridX, gridY);
        
        // Prende as coordenadas aos limites do canvas para evitar erros
        const clampedX = Math.max(0, Math.min(this.canvas.width - 1, Math.round(screenPos.x)));
        const clampedY = Math.max(0, Math.min(this.canvas.height - 1, Math.round(screenPos.y)));

        try {
            const pixelData = this.ctx.getImageData(clampedX, clampedY, 1, 1).data;
            return { r: pixelData[0], g: pixelData[1], b: pixelData[2], a: pixelData[3] };
        } catch (e) {
            console.error("Erro ao ler dados de pixel (pode ser devido a políticas de segurança do navegador):", e);
            // Retorna branco como padrão em caso de erro
            return { r: 255, g: 255, b: 255, a: 255 };
        }
    }

    // =======================================================================
    // Seção: Manipuladores de Eventos (Event Handlers)
    // =======================================================================

    /**
     * Lida com o movimento do mouse sobre o canvas.
     * @param {MouseEvent} e - O objeto de evento do mouse.
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const gridCoords = this.screenToGrid(e.clientX - rect.left, e.clientY - rect.top);

        // Se estivermos no modo de definir o ponto final da linha, desenha uma pré-visualização.
        if (this.drawingState.mode === 'line_end') {
            this.redrawCanvas();
            const startPoint = this.drawingState.points[0];
            
            // Desenha uma linha auxiliar para guiar o usuário
            const startScreen = this.gridToScreen(startPoint.x, startPoint.y);
            const endScreen = this.gridToScreen(gridCoords.x, gridCoords.y);
            
            this.ctx.strokeStyle = '#aaaaaa';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]); // Linha tracejada para indicar pré-visualização
            this.ctx.beginPath();
            this.ctx.moveTo(startScreen.x, startScreen.y);
            this.ctx.lineTo(endScreen.x, endScreen.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]); // Remove o tracejado
            
            this.updateCoordinatesDisplay(`Ponto final: (${gridCoords.x}, ${gridCoords.y}) | Clique para finalizar.`);
        }
        // Se estivermos no modo de definir o raio do círculo, desenha uma pré-visualização.
        else if (this.drawingState.mode === 'circle_radius') {
            this.redrawCanvas();
            const center = this.drawingState.points[0];
            const radius = Math.round(Math.sqrt(Math.pow(gridCoords.x - center.x, 2) + Math.pow(gridCoords.y - center.y, 2)));
            
            // Desenha um círculo auxiliar para guiar o usuário
            const screenPos = this.gridToScreen(center.x, center.y);
            this.ctx.strokeStyle = '#aaaaaa';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, radius * this.gridSize, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.updateCoordinatesDisplay(`Raio: ${radius} | Clique para finalizar.`);
        }
        // Pré-visualização para Elipse (Raio X)
        else if (this.drawingState.mode === 'ellipse_rx') {
            this.redrawCanvas();
            const center = this.drawingState.points[0];
            const radiusX = Math.abs(gridCoords.x - center.x);
            // Desenha linha horizontal de prévia
            const startScreen = this.gridToScreen(center.x - radiusX, center.y);
            const endScreen = this.gridToScreen(center.x + radiusX, center.y);
            this.ctx.strokeStyle = '#aaaaaa'; this.ctx.lineWidth = 1; this.ctx.beginPath(); this.ctx.moveTo(startScreen.x, startScreen.y); this.ctx.lineTo(endScreen.x, endScreen.y); this.ctx.stroke();
            this.updateCoordinatesDisplay(`Raio X: ${radiusX} | Clique para definir.`);
        }
        // Pré-visualização para Elipse (Raio Y e Elipse completa)
        else if (this.drawingState.mode === 'ellipse_ry') {
            this.redrawCanvas();
            const center = this.drawingState.points[0];
            const radiusX = this.drawingState.points[1].x; // rx já foi salvo
            const radiusY = Math.abs(gridCoords.y - center.y);
            // Desenha elipse de prévia
            const screenCenter = this.gridToScreen(center.x, center.y);
            this.ctx.strokeStyle = '#aaaaaa'; this.ctx.lineWidth = 1; this.ctx.beginPath(); this.ctx.ellipse(screenCenter.x, screenCenter.y, radiusX * this.gridSize, radiusY * this.gridSize, 0, 0, 2 * Math.PI); this.ctx.stroke();
            this.updateCoordinatesDisplay(`Raio Y: ${radiusY} | Clique para finalizar.`);
        }
        // Se estivermos no modo de desenhar polilinha, desenha uma pré-visualização do próximo segmento.
        else if (this.drawingState.mode === 'polyline_draw' && this.drawingState.points.length > 0) {
            this.redrawCanvas(); // Limpa prévias antigas
            
            // Desenha os segmentos já confirmados
            Polyline.drawPolyline(this, this.drawingState.points);

            // Desenha uma linha auxiliar para o próximo segmento
            const lastPoint = this.drawingState.points[this.drawingState.points.length - 1];
            const startScreen = this.gridToScreen(lastPoint.x, lastPoint.y);
            const endScreen = this.gridToScreen(gridCoords.x, gridCoords.y);
            
            this.ctx.strokeStyle = '#aaaaaa';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(startScreen.x, startScreen.y);
            this.ctx.lineTo(endScreen.x, endScreen.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            this.updateCoordinatesDisplay(`Próximo ponto: (${gridCoords.x}, ${gridCoords.y}) | Clique duplo para finalizar.`);
        }
        else if (!this.drawingState.mode) {
            // Se não estiver em nenhum modo, apenas mostra as coordenadas.
            const isValid = this.validateCoordinates(gridCoords.x, gridCoords.y);
            const status = isValid ? '' : ' (fora dos limites)';
            this.updateCoordinatesDisplay(`Coordenadas: (${gridCoords.x}, ${gridCoords.y})${status}`);
        }
    }

    /**
     * Lida com o clique do mouse no canvas.
     * @param {MouseEvent} e - O objeto de evento do mouse.
     */
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const gridCoords = this.screenToGrid(e.clientX - rect.left, e.clientY - rect.top);

        // Lógica para o desenho interativo da linha (Bresenham)
        if (this.drawingState.mode === 'line_start') {
            // Valida se o ponto inicial está dentro dos limites
            if (!this.validateCoordinates(gridCoords.x, gridCoords.y)) {
                this.updateCoordinatesDisplay('Erro: Ponto inicial fora dos limites da grade!');
                return;
            }
            this.drawingState.points.push(gridCoords);
            this.drawingState.mode = 'line_end'; // Avança para o próximo passo
            this.updateCoordinatesDisplay('Clique novamente para definir o ponto final da linha.');
        } else if (this.drawingState.mode === 'line_end') {
            // Valida se o ponto final está dentro dos limites
            if (!this.validateCoordinates(gridCoords.x, gridCoords.y)) {
                this.updateCoordinatesDisplay('Erro: Ponto final fora dos limites da grade!');
                return;
            }
            const startPoint = this.drawingState.points[0];
            
            // Salva o desenho antes de executá-lo
            this.saveDrawing({
                type: 'line',
                x1: startPoint.x,
                y1: startPoint.y,
                x2: gridCoords.x,
                y2: gridCoords.y,
                color: this.drawColor,
                lineWidth: this.lineWidth
            });
            
            bresenhamLine(this, startPoint.x, startPoint.y, gridCoords.x, gridCoords.y, this.drawColor);
            this.resetDrawingState(); // Finaliza o desenho
        }
        // Lógica para o desenho interativo do círculo
        else if (this.drawingState.mode === 'circle_center') {
            // Valida se o centro está dentro dos limites
            if (!this.validateCoordinates(gridCoords.x, gridCoords.y)) {
                this.updateCoordinatesDisplay('Erro: Centro fora dos limites da grade!');
                return;
            }
            this.drawingState.points.push(gridCoords);
            this.drawingState.mode = 'circle_radius'; // Avança para o próximo passo
            this.updateCoordinatesDisplay('Clique novamente para definir o raio.');
        } else if (this.drawingState.mode === 'circle_radius') {
            const center = this.drawingState.points[0];
            const radius = Math.round(Math.sqrt(Math.pow(gridCoords.x - center.x, 2) + Math.pow(gridCoords.y - center.y, 2)));
            
            // Valida se o raio não excede os limites
            const halfWidth = Math.floor(this.gridWidth / 2);
            const halfHeight = Math.floor(this.gridHeight / 2);
            if (radius > Math.min(halfWidth, halfHeight)) {
                this.updateCoordinatesDisplay('Erro: Raio muito grande para a grade atual!');
                return;
            }
            
            // Salva o desenho antes de executá-lo
            this.saveDrawing({
                type: 'circle',
                centerX: center.x,
                centerY: center.y,
                radius: radius,
                color: this.drawColor,
                lineWidth: this.lineWidth
            });
            
            midpointCircle(this, center.x, center.y, radius, this.drawColor);
            this.resetDrawingState(); // Finaliza o desenho
        }
        else if (this.drawingState.mode === 'ellipse_center') {
            this.drawingState.points.push(gridCoords);
            this.drawingState.mode = 'ellipse_rx';
            this.updateCoordinatesDisplay('Clique para definir o raio horizontal (rx).');
        } else if (this.drawingState.mode === 'ellipse_rx') {
            const center = this.drawingState.points[0];
            const radiusX = Math.abs(gridCoords.x - center.x);
            this.drawingState.points.push({ x: radiusX }); // Salva o raio X
            this.drawingState.mode = 'ellipse_ry';
            this.updateCoordinatesDisplay('Clique para definir o raio vertical (ry).');
        } else if (this.drawingState.mode === 'ellipse_ry') {
            const center = this.drawingState.points[0];
            const radiusX = this.drawingState.points[1].x;
            const radiusY = Math.abs(gridCoords.y - center.y);
            
            this.saveDrawing({ type: 'ellipse', centerX: center.x, centerY: center.y, radiusX, radiusY, color: this.drawColor });
            midpointEllipse(this, center.x, center.y, radiusX, radiusY, this.drawColor); // Passa a cor
            this.resetDrawingState();
        }
        // Lógica para o desenho interativo da polilinha
        else if (this.drawingState.mode === 'polyline_draw') {
            if (!this.validateCoordinates(gridCoords.x, gridCoords.y)) {
                this.updateCoordinatesDisplay('Erro: Ponto fora dos limites da grade!');
                return;
            }
            this.drawingState.points.push(gridCoords);
            this.redrawCanvas();
            Polyline.drawPolyline(this, this.drawingState.points, this.drawColor);
        }
        // Lógica para o preenchimento interativo
        else if (this.drawingState.mode === 'fill_seed_point') {
            if (!this.validateCoordinates(gridCoords.x, gridCoords.y)) {
                this.updateCoordinatesDisplay('Erro: Ponto de semente fora dos limites da grade!');
                return;
            }
            // Chama o algoritmo Flood Fill com o ponto clicado
            const pointsToFill = Fill.floodFill(gridCoords.x, gridCoords.y, this.drawColor, this);
            if (pointsToFill.length > 0) {
                const fillDrawing = { type: 'fill', points: pointsToFill, color: this.drawColor };
                this.saveDrawing(fillDrawing);
                this.drawSavedDrawing(fillDrawing); // Desenha imediatamente
            }
            this.resetDrawingState(); // Finaliza o modo de preenchimento
        }
    }

    /**
     * Lida com o clique duplo do mouse no canvas para finalizar desenhos.
     * @param {MouseEvent} e - O objeto de evento do mouse.
     */
    handleCanvasDblClick(e) {
        e.preventDefault(); // Previne a seleção de texto padrão do navegador
        if (this.drawingState.mode === 'polyline_draw' && this.drawingState.points.length >= 2) {
            // Fecha o polígono conectando o último ponto ao primeiro
            const finalPoints = [...this.drawingState.points];
            
            const drawingData = {
                type: 'polygon', // Salva como polígono fechado
                points: finalPoints,
                color: this.drawColor,
                lineWidth: this.lineWidth
            };

            this.saveDrawing(drawingData);
            this.lastPolygon = drawingData; // Armazena como o último polígono desenhado
            
            this.redrawCanvas();
            this.resetDrawingState();
        }
    }
    
    /**
     * Lida com o scroll do mouse para zoom (Ctrl+Scroll).
     * @param {WheelEvent} e - O objeto de evento do wheel.
     */
    handleMouseWheel(e) {
        // Verifica se Ctrl está pressionado
        if (!e.ctrlKey) return;
        
        // Previne o comportamento padrão do scroll
        e.preventDefault();
        
        // Determina a direção do zoom
        const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
        const newZoomLevel = this.zoomLevel + delta;
        
        // Aplica o zoom
        this.setZoom(newZoomLevel);
    }

    // =======================================================================
    // Seção: Métodos de Controle e Chamada de Algoritmos
    // =======================================================================
    
    /** Limpa o canvas e reseta o estado de desenho. */
    clearCanvas() {
        this.savedDrawings = []; // Limpa todos os desenhos salvos
        this.lastPolygon = null; // Limpa a referência ao último polígono
        this.redrawCanvas();
        this.resetDrawingState();
    }
    
    /** Alterna a visibilidade da grade. */
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.redrawCanvas();
    }
    
    /** Aplica o novo tamanho da grade e atualiza os limites dos inputs. */
    applyGridSize() {
        this.gridWidth = parseInt(document.getElementById('gridWidth').value);
        this.gridHeight = parseInt(document.getElementById('gridHeight').value);
        
        // Mantém o zoom atual, mas atualiza o tamanho base
        this.baseGridSize = 20; // Tamanho base dos pixels
        this.gridSize = Math.round(this.baseGridSize * this.zoomLevel);
        
        // Redimensiona o canvas para acomodar a nova grade
        this.resizeCanvas();
        
        // Atualiza os limites dos inputs dos algoritmos
        this.updateInputLimits();
        
        // Centraliza o scroll na nova grade
        this.centerScroll();
        
        // Redesenha o canvas com a nova grade
        this.redrawCanvas();
        
        // Atualiza a informação visual do tamanho do pixel
        document.getElementById('currentPixelSize').textContent = this.gridSize;
        
        this.updateCoordinatesDisplay(`Grade atualizada: ${this.gridWidth}x${this.gridHeight} (pixel: ${this.gridSize}px)`);
    }
    
    /** Redimensiona o canvas para acomodar a nova grade. */
    resizeCanvas() {
        // Calcula o novo tamanho do canvas baseado na grade
        const newWidth = this.gridWidth * this.gridSize;
        const newHeight = this.gridHeight * this.gridSize;
        
        // Redimensiona o canvas
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        
        // Atualiza o contexto após redimensionar
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }
    
    /** Calcula o tamanho ideal dos pixels da grade para que ela caiba completamente no canvas. */
    calculateOptimalGridSize() {
        // Margem de segurança para não colar nas bordas do canvas
        const margin = 60; // Aumentei a margem para dar mais espaço
        const availableWidth = this.canvas.width - margin;
        const availableHeight = this.canvas.height - margin;
        
        // Calcula o tamanho máximo que cada célula pode ter
        const maxCellWidth = availableWidth / this.gridWidth;
        const maxCellHeight = availableHeight / this.gridHeight;
        
        // Usa o menor valor para garantir que a grade caiba tanto em largura quanto em altura
        this.gridSize = Math.floor(Math.min(maxCellWidth, maxCellHeight));
        
        // Garante um tamanho mínimo para legibilidade
        this.gridSize = Math.max(this.gridSize, 6);
        
        // Para grades muito grandes, garante que pelo menos seja visível
        if (this.gridSize < 6) {
            this.gridSize = 6;
        }
    }
    
    /** Mostra uma prévia do tamanho do pixel que será usado para a grade selecionada. */
    previewGridSize() {
        const previewWidth = parseInt(document.getElementById('gridWidth').value);
        const previewHeight = parseInt(document.getElementById('gridHeight').value);
        
        // Tamanho do pixel considerando o zoom atual
        const previewPixelSize = Math.round(this.baseGridSize * this.zoomLevel);
        
        // Calcula o tamanho total que a grade terá
        const totalWidth = previewWidth * previewPixelSize;
        const totalHeight = previewHeight * previewPixelSize;
        
        // Atualiza a informação visual
        document.getElementById('currentPixelSize').textContent = `${previewPixelSize}px (${totalWidth}x${totalHeight}px)`;
    }
    
    /** Atualiza os limites (min/max) de todos os inputs de coordenadas. */
    updateInputLimits() {
        const halfWidth = Math.floor(this.gridWidth / 2);
        const halfHeight = Math.floor(this.gridHeight / 2);
        
        // Atualiza limites para Bresenham (linhas)
        const bresenhamInputs = ['x1', 'y1', 'x2', 'y2'];
        bresenhamInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                if (id === 'x1' || id === 'x2') {
                    input.max = halfWidth;
                    input.min = -halfWidth;
                } else {
                    input.max = halfHeight;
                    input.min = -halfHeight;
                }
            }
        });
        
        // Atualiza limites para círculos
        const circleInputs = ['circleX', 'circleY'];
        circleInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                if (id === 'circleX') {
                    input.max = halfWidth;
                    input.min = -halfWidth;
                } else {
                    input.max = halfHeight;
                    input.min = -halfHeight;
                }
            }
        });
        
        // Atualiza limite do raio do círculo
        const radiusInput = document.getElementById('circleRadius');
        if (radiusInput) {
            const maxRadius = Math.min(halfWidth, halfHeight);
            radiusInput.max = maxRadius;
            radiusInput.min = 1;
        }
        
        // Atualiza a informação visual do tamanho do pixel com zoom
        document.getElementById('currentPixelSize').textContent = `${this.gridSize}px (zoom: ${Math.round(this.zoomLevel * 100)}%)`;
        
        // Atualiza limites para elipse
        const ellipseInputs = ['ellipseX', 'ellipseY'];
        ellipseInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                if (id === 'ellipseX') {
                    input.max = halfWidth;
                    input.min = -halfWidth;
                } else {
                    input.max = halfHeight;
                    input.min = -halfHeight;
                }
            }
        });
        
        // Atualiza limites para preenchimento
        const fillInputs = ['seedX', 'seedY'];
        fillInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                if (id === 'seedX') {
                    input.max = halfWidth;
                    input.min = -halfWidth;
                } else {
                    input.max = halfHeight;
                    input.min = -halfHeight;
                }
            }
        });
    }
    
    /** Reseta o estado do desenho interativo para o padrão. */
    resetDrawingState() {
        this.drawingState.mode = null;
        this.drawingState.points = [];
        this.updateCoordinatesDisplay('Passe o mouse sobre o canvas para ver as coordenadas.');
    }

    /** Atualiza o texto de coordenadas/status na tela. */
    updateCoordinatesDisplay(message) {
        document.getElementById('coordinatesDisplay').textContent = message;
    }
    
    /** Valida se as coordenadas estão dentro dos limites da grade. */
    validateCoordinates(x, y) {
        const halfWidth = Math.floor(this.gridWidth / 2);
        const halfHeight = Math.floor(this.gridHeight / 2);
        return x >= -halfWidth && x <= halfWidth && y >= -halfHeight && y <= halfHeight;
    }
    
    /** Aciona o algoritmo de Bresenham com os valores dos inputs. */
    drawLineFromInput() {
        this.resetDrawingState();
        const x1 = parseInt(document.getElementById('x1').value);
        const y1 = parseInt(document.getElementById('y1').value);
        const x2 = parseInt(document.getElementById('x2').value);
        const y2 = parseInt(document.getElementById('y2').value);
        
        // Valida se as coordenadas estão dentro dos limites da grade
        if (!this.validateCoordinates(x1, y1) || !this.validateCoordinates(x2, y2)) {
            this.updateCoordinatesDisplay('Erro: Coordenadas fora dos limites da grade!');
            return;
        }
        
        // Salva o desenho antes de executá-lo
        this.saveDrawing({
            type: 'line',
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            color: this.drawColor,
            lineWidth: this.lineWidth
        });
        
        bresenhamLine(this, x1, y1, x2, y2, this.drawColor);
    }

    /** Inicia o modo de desenho interativo para linhas (Bresenham). */
    startInteractiveLineDraw() {
        this.resetDrawingState();
        this.drawingState.mode = 'line_start';
        this.updateCoordinatesDisplay('Clique no canvas para definir o ponto inicial da linha.');
    }
    
    /** Aciona o algoritmo de Círculo com os valores dos inputs. */
    drawCircleFromInput() {
        this.resetDrawingState();
        const centerX = parseInt(document.getElementById('circleX').value);
        const centerY = parseInt(document.getElementById('circleY').value);
        const radius = parseInt(document.getElementById('circleRadius').value);
        
        // Valida se as coordenadas estão dentro dos limites da grade
        if (!this.validateCoordinates(centerX, centerY)) {
            this.updateCoordinatesDisplay('Erro: Centro do círculo fora dos limites da grade!');
            return;
        }
        
        // Valida se o raio não excede os limites
        const halfWidth = Math.floor(this.gridWidth / 2);
        const halfHeight = Math.floor(this.gridHeight / 2);
        if (radius > Math.min(halfWidth, halfHeight)) {
            this.updateCoordinatesDisplay('Erro: Raio muito grande para a grade atual!');
            return;
        }
        
        // Salva o desenho antes de executá-lo
        this.saveDrawing({
            type: 'circle',
            centerX: centerX,
            centerY: centerY,
            radius: radius,
            color: this.drawColor,
            lineWidth: this.lineWidth
        });
        
        midpointCircle(this, centerX, centerY, radius, this.drawColor);
    }

    /** Inicia o modo de desenho interativo para círculos. */
    startInteractiveCircleDraw() {
        this.resetDrawingState();
        this.drawingState.mode = 'circle_center';
        this.updateCoordinatesDisplay('Clique no canvas para definir o centro do círculo.');
    }

    /**
     * Aciona o algoritmo de Elipse com os valores dos inputs.
     */
    drawEllipseFromInput() {
        this.resetDrawingState();
        const centerX = parseInt(document.getElementById('ellipseX').value);
        const centerY = parseInt(document.getElementById('ellipseY').value);
        const radiusX = parseInt(document.getElementById('ellipseA').value);
        const radiusY = parseInt(document.getElementById('ellipseB').value);
        
        // Guarda o desenho antes de o executar
        this.saveDrawing({ 
            type: 'ellipse', 
            centerX: centerX, 
            centerY: centerY, 
            radiusX: radiusX, 
            radiusY: radiusY, 
            color: this.drawColor 
        });

        midpointEllipse(this, centerX, centerY, radiusX, radiusY, this.drawColor); // Passa a cor
    }

    startInteractiveEllipseDraw() {
        this.resetDrawingState();
        this.drawingState.mode = 'ellipse_center';
        this.updateCoordinatesDisplay('Clique no canvas para definir o centro da elipse.');
    }

    /**
     * Aciona o algoritmo de Curva de Bézier com os valores dos inputs.
     */
    drawBezierFromInput() {
        this.resetDrawingState();
        const p0 = { x: parseInt(document.getElementById('bezierP0x').value), y: parseInt(document.getElementById('bezierP0y').value) };
        const p1 = { x: parseInt(document.getElementById('bezierP1x').value), y: parseInt(document.getElementById('bezierP1y').value) };
        const p2 = { x: parseInt(document.getElementById('bezierP2x').value), y: parseInt(document.getElementById('bezierP2y').value) };
        
        // Guarda o desenho antes de o executar
        this.saveDrawing({
            type: 'bezier',
            p0: p0,
            p1: p1,
            p2: p2,
            color: this.drawColor
        });
        
        drawBezierCurve(this, p0, p1, p2, this.drawColor);
    }

    /** Aciona o algoritmo de Polilinha com os valores dos inputs. */
    drawPolylineFromInput() {
        this.resetDrawingState();
        const pointsStr = document.getElementById('polylinePoints').value.trim();
        const points = pointsStr.split(',').map(p => p.trim());

        if (points.length % 2 !== 0 || points.length === 0) {
            this.updateCoordinatesDisplay('Erro: Formato de pontos inválido. Use pares de x,y separados por vírgula.');
            return;
        }

        const polylinePoints = [];
        for (let i = 0; i < points.length; i += 2) {
            const x = parseInt(points[i]);
            const y = parseInt(points[i + 1]);

            if (isNaN(x) || isNaN(y) || !this.validateCoordinates(x, y)) {
                this.updateCoordinatesDisplay(`Erro: Ponto (${x}, ${y}) inválido ou fora dos limites.`);
                return;
            }
            polylinePoints.push({ x, y });
        }
        
        const drawingData = {
            type: 'polygon', // Salva como polígono
            points: polylinePoints,
            color: this.drawColor,
            lineWidth: this.lineWidth
        };

        this.saveDrawing(drawingData);
        this.lastPolygon = drawingData; // Armazena como último polígono

        Polyline.drawPolygon(this, polylinePoints, this.drawColor);
    }

    /** Inicia o modo de desenho interativo para polilinhas. */
    startInteractivePolylineDraw() {
        this.resetDrawingState();
        this.drawingState.mode = 'polyline_draw';
        this.updateCoordinatesDisplay('Clique para adicionar pontos. Dê um clique duplo para finalizar.');
    }
    
    /** Aciona o algoritmo de preenchimento com os valores dos inputs. */
    fillAreaFromInput() {
        this.resetDrawingState();
        const algorithm = document.getElementById('fillAlgorithm').value;
        const seedX = parseInt(document.getElementById('seedX').value);
        const seedY = parseInt(document.getElementById('seedY').value);
        const fillColor = this.drawColor;

        if (algorithm === 'recursive') {
            if (!this.validateCoordinates(seedX, seedY)) {
                this.updateCoordinatesDisplay('Erro: Ponto de semente fora dos limites da grade!');
                return;
            }
            const pointsToFill = Fill.floodFill(seedX, seedY, fillColor, this);
            if (pointsToFill.length > 0) {
                const fillDrawing = { type: 'fill', points: pointsToFill, color: fillColor };
                this.saveDrawing(fillDrawing);
                this.drawSavedDrawing(fillDrawing); // Desenha imediatamente
            }
        } else if (algorithm === 'scanline') {
            if (this.lastPolygon) {
                // O Scanline ainda desenha diretamente pois é mais complexo de salvar como pontos
                Fill.scanlineFill(this.lastPolygon.points, fillColor, this);
            } else {
                alert('Nenhum polígono foi desenhado para preencher. Desenhe um polígono primeiro usando a ferramenta de Polilinha Interativa (e clique duplo para fechar).');
            }
        }
    }
    
    /** Inicia o modo de preenchimento interativo (Flood Fill). */
    startInteractiveFill() {
        this.resetDrawingState();
        this.drawingState.mode = 'fill_seed_point';
        // Define o algoritmo para Recursivo/Flood Fill, já que é o único que usa um ponto de semente
        document.getElementById('fillAlgorithm').value = 'recursive'; 
        this.updateCoordinatesDisplay('Clique em uma área fechada para preencher.');
    }





    // Adicione estes dois novos métodos dentro da classe GraphicsCanvas.

    /**
     * Calcula o centroide (ponto central) de uma forma baseada em seus vértices.
     * @param {Array<{x: number, y: number}>} points - A lista de pontos da forma.
     * @returns {{x: number, y: number}} O ponto central.
     * @private
     */
    _getShapeCentroid(points) {
        if (!points || points.length === 0) return { x: 0, y: 0 };
        const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        return {
            x: Math.round(sum.x / points.length),
            y: Math.round(sum.y / points.length)
        };
    }

    /**
     * Aplica a transformação selecionada ao último objeto desenhado que seja transformável (com pontos).
     */
    applyTransform() {
        // Encontra o último desenho que possui um array de 'points' (polígonos, polilinhas, etc.)
        const lastDrawing = this.savedDrawings.slice().reverse().find(d => d.points);

        if (!lastDrawing || !lastDrawing.points) {
            alert("Nenhum objeto transformável (como um polígono) foi desenhado. Desenhe uma polilinha e feche-a com um clique duplo.");
            return;
        }

        const type = document.getElementById('transformType').value;
        let transformedPoints = []; // Array para guardar os novos pontos

        switch (type) {
            case 'translation': { // Usamos chaves para criar um escopo para as variáveis
                const dx = parseFloat(document.getElementById('translateX').value);
                const dy = parseFloat(document.getElementById('translateY').value);
                
                // 1. CHAMA A FUNÇÃO DE TRANSLAÇÃO
                transformedPoints = Transformations.translate(lastDrawing.points, dx, dy);
                break;
            }

            case 'rotation': {
                const angle = parseFloat(document.getElementById('rotationAngle').value);
                // O pivô é um objeto {x, y}
                const pivot = {
                    x: parseFloat(document.getElementById('rotationPivotX').value),
                    y: parseFloat(document.getElementById('rotationPivotY').value)
                };
                
                // 2. CHAMA A FUNÇÃO DE ROTAÇÃO
                transformedPoints = Transformations.rotate(lastDrawing.points, angle, pivot);
                break;
            }

            case 'scale': {
                const sx = parseFloat(document.getElementById('scaleX').value);
                const sy = parseFloat(document.getElementById('scaleY').value);
                // O ponto fixo (pivô) também é um objeto {x, y}
                const center = {
                    x: parseFloat(document.getElementById('scaleCenterX').value),
                    y: parseFloat(document.getElementById('scaleCenterY').value)
                };

                // 3. CHAMA A FUNÇÃO DE ESCALA
                transformedPoints = Transformations.scale(lastDrawing.points, sx, sy, center);
                break;
            }
        }

        // 4. ATUALIZA O OBJETO ORIGINAL com os novos pontos transformados
        if (transformedPoints.length > 0) {
            lastDrawing.points = transformedPoints;
        }
        
        // 5. REDESENHA O CANVAS para mostrar o resultado da transformação
        this.redrawCanvas();
    }

    /**
     * Lida com a mudança no seletor de tipo de transformação, mostrando os inputs relevantes.
     */
    handleTransformTypeChange(event) {
        const selectedType = event.target.value;
        
        // Esconde todos os containers de input de transformação
        document.querySelectorAll('.transform-inputs').forEach(div => {
            div.style.display = 'none';
        });

        // Mostra apenas o container relevante
        document.getElementById(`${selectedType}Inputs`).style.display = 'block';
    }

}

// =======================================================================
// Seção: Ponto de Entrada da Aplicação
// =======================================================================

/**
 * Event listener que espera o HTML ser completamente carregado para iniciar o script.
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando protótipo de Computação Gráfica...');
    new GraphicsCanvas('drawingCanvas'); // Cria a instância da nossa classe principal
    console.log('Canvas inicializado com sucesso!');
});