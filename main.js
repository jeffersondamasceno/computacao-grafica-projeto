/**
 * @file Arquivo principal (entry point) da aplicação de Computação Gráfica.
 * - Gerencia a classe principal GraphicsCanvas.
 * - Importa e utiliza os módulos de algoritmos.
 * - Inicializa a aplicação quando o HTML é carregado.
 */

// Importa os algoritmos dos arquivos separados para que possamos usá-los aqui.
import { midpointCircle } from './algorithms/midpointCircle.js';
import { bresenhamLine } from './algorithms/bresenham.js';

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
        this.ctx = this.canvas.getContext('2d');

        // --- 2. CONFIGURAÇÕES DO AMBIENTE ---
        this.gridSize = 20; // Tamanho de cada célula da malha em pixels (fixo e confortável)
        this.showGrid = true; // Controla a visibilidade da malha
        
        // Configurações da grade (limites do sistema de coordenadas)
        this.gridWidth = 20; // Largura da grade em unidades (X)
        this.gridHeight = 15; // Altura da grade em unidades (Y)
        
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
            mode: null,   // Ex: 'circle_center', 'circle_radius'
            points: [],   // Armazena os pontos que o usuário clica
        };
        
        // Array para armazenar todos os desenhos feitos na grade
        this.savedDrawings = [];
        
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
        
        // Placeholders para algoritmos futuros
        document.getElementById('drawEllipse').addEventListener('click', () => alert('Algoritmo de elipse ainda não implementado.'));

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
        // Salva o estado atual do contexto
        this.ctx.save();
        
        // Aplica as configurações do desenho
        this.ctx.fillStyle = drawing.color;
        this.ctx.strokeStyle = drawing.color;
        this.ctx.lineWidth = drawing.lineWidth;
        
        if (drawing.type === 'line') {
            // Desenha uma linha usando o algoritmo de Bresenham
            bresenhamLine(this, drawing.x1, drawing.y1, drawing.x2, drawing.y2);
        } else if (drawing.type === 'circle') {
            // Desenha um círculo usando o algoritmo de midpoint
            midpointCircle(this, drawing.centerX, drawing.centerY, drawing.radius);
        }
        
        // Restaura o estado do contexto
        this.ctx.restore();
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
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const halfWidth = Math.floor(this.gridWidth / 2);
        const halfHeight = Math.floor(this.gridHeight / 2);
        
        // Calcula os limites da grade em pixels
        const leftBound = centerX - halfWidth * this.gridSize;
        const rightBound = centerX + halfWidth * this.gridSize;
        const topBound = centerY - halfHeight * this.gridSize;
        const bottomBound = centerY + halfHeight * this.gridSize;
        
        // Desenha as linhas finas da grade apenas dentro dos limites
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        
        // Linhas verticais
        for (let x = leftBound; x <= rightBound; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, topBound);
            this.ctx.lineTo(x, bottomBound);
            this.ctx.stroke();
        }
        
        // Linhas horizontais
        for (let y = topBound; y <= bottomBound; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(leftBound, y);
            this.ctx.lineTo(rightBound, y);
            this.ctx.stroke();
        }
        
        // Desenha os eixos X e Y (mais grossos e escuros)
        this.ctx.strokeStyle = '#999999';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(leftBound, centerY);
        this.ctx.lineTo(rightBound, centerY);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, topBound);
        this.ctx.lineTo(centerX, bottomBound);
        this.ctx.stroke();

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
        } else if (!this.drawingState.mode) {
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
            
            bresenhamLine(this, startPoint.x, startPoint.y, gridCoords.x, gridCoords.y);
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
            
            midpointCircle(this, center.x, center.y, radius);
            this.resetDrawingState(); // Finaliza o desenho
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
        this.ctx = this.canvas.getContext('2d');
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
        
        bresenhamLine(this, x1, y1, x2, y2);
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
        
        midpointCircle(this, centerX, centerY, radius);
    }

    /** Inicia o modo de desenho interativo para linhas (Bresenham). */
    startInteractiveLineDraw() {
        this.resetDrawingState();
        this.drawingState.mode = 'line_start';
        this.updateCoordinatesDisplay('Clique no canvas para definir o ponto inicial da linha.');
    }

    /** Inicia o modo de desenho interativo para círculos. */
    startInteractiveCircleDraw() {
        this.resetDrawingState();
        this.drawingState.mode = 'circle_center';
        this.updateCoordinatesDisplay('Clique no canvas para definir o centro do círculo.');
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