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
        this.gridSize = 20; // Tamanho de cada célula da malha em pixels
        this.showGrid = true; // Controla a visibilidade da malha

        // --- 3. ESTADO DO DESENHO ---
        this.drawColor = '#ff0000'; // Cor padrão para novas formas
        this.lineWidth = 1; // Espessura padrão para linhas

        // Objeto que controla o estado de desenhos interativos (multi-cliques)
        this.drawingState = {
            mode: null,   // Ex: 'circle_center', 'circle_radius'
            points: [],   // Armazena os pontos que o usuário clica
        };
        
        // Inicia a configuração da aplicação
        this.init();
    }

    /**
     * Método de inicialização. Configura os event listeners e desenha o estado inicial do canvas.
     */
    init() {
        this.setupEventListeners();
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

        // Eventos de botões de controle geral
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('toggleGrid').addEventListener('click', () => this.toggleGrid());

        // Eventos para acionar os algoritmos de desenho
        document.getElementById('drawLine').addEventListener('click', () => this.drawLineFromInput());
        document.getElementById('drawCircleFromInput').addEventListener('click', () => this.drawCircleFromInput());
        document.getElementById('drawCircleInteractive').addEventListener('click', () => this.startInteractiveCircleDraw());
        
        // Placeholders para algoritmos futuros
        document.getElementById('drawEllipse').addEventListener('click', () => alert('Algoritmo de elipse ainda não implementado.'));

        // Eventos para as configurações de desenho (cor, espessura)
        document.getElementById('drawColor').addEventListener('change', (e) => { this.drawColor = e.target.value; });
        document.getElementById('lineWidth').addEventListener('input', (e) => { this.lineWidth = parseInt(e.target.value); });
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
    }

    /**
     * Desenha a malha quadriculada e os eixos cartesianos no canvas.
     */
    drawGrid() {
        if (!this.showGrid) return;
        
        // Desenha as linhas finas da grade
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke();
        }
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y); this.ctx.stroke();
        }
        
        // Desenha os eixos X e Y (mais grossos e escuros)
        this.ctx.strokeStyle = '#999999';
        this.ctx.lineWidth = 1;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.ctx.beginPath(); this.ctx.moveTo(0, centerY); this.ctx.lineTo(this.canvas.width, centerY); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.moveTo(centerX, 0); this.ctx.lineTo(centerX, this.canvas.height); this.ctx.stroke();

        this.drawCoordinateNumbers();
    }
    
    /**
     * Desenha os números das coordenadas ao longo dos eixos X e Y.
     */
    drawCoordinateNumbers() {
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        
        // Números no eixo X
        for (let x = this.gridSize; x < this.canvas.width; x += this.gridSize) {
            const coordX = this.screenToGrid(x, this.canvas.height / 2).x;
            if (coordX !== 0) this.ctx.fillText(coordX.toString(), x, this.canvas.height / 2 - 5);
        }
        
        // Números no eixo Y
        this.ctx.textAlign = 'right';
        for (let y = this.gridSize; y < this.canvas.height; y += this.gridSize) {
            const coordY = this.screenToGrid(this.canvas.width / 2, y).y;
            if (coordY !== 0) this.ctx.fillText(coordY.toString(), this.canvas.width / 2 - 5, y + 4);
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

        // Se estivermos no modo de definir o raio do círculo, desenha uma pré-visualização.
        if (this.drawingState.mode === 'circle_radius') {
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
            this.updateCoordinatesDisplay(`Coordenadas: (${gridCoords.x}, ${gridCoords.y})`);
        }
    }

    /**
     * Lida com o clique do mouse no canvas.
     * @param {MouseEvent} e - O objeto de evento do mouse.
     */
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const gridCoords = this.screenToGrid(e.clientX - rect.left, e.clientY - rect.top);

        // Lógica para o desenho interativo do círculo
        if (this.drawingState.mode === 'circle_center') {
            this.drawingState.points.push(gridCoords);
            this.drawingState.mode = 'circle_radius'; // Avança para o próximo passo
            this.updateCoordinatesDisplay('Clique novamente para definir o raio.');
        } else if (this.drawingState.mode === 'circle_radius') {
            const center = this.drawingState.points[0];
            const radius = Math.round(Math.sqrt(Math.pow(gridCoords.x - center.x, 2) + Math.pow(gridCoords.y - center.y, 2)));
            midpointCircle(this, center.x, center.y, radius);
            this.resetDrawingState(); // Finaliza o desenho
        }
    }

    // =======================================================================
    // Seção: Métodos de Controle e Chamada de Algoritmos
    // =======================================================================
    
    /** Limpa o canvas e reseta o estado de desenho. */
    clearCanvas() {
        this.redrawCanvas();
        this.resetDrawingState();
    }
    
    /** Alterna a visibilidade da grade. */
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.redrawCanvas();
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
    
    /** Aciona o algoritmo de Bresenham com os valores dos inputs. */
    drawLineFromInput() {
        this.resetDrawingState();
        const x1 = parseInt(document.getElementById('x1').value);
        const y1 = parseInt(document.getElementById('y1').value);
        const x2 = parseInt(document.getElementById('x2').value);
        const y2 = parseInt(document.getElementById('y2').value);
        
        // CORREÇÃO AQUI: O nome da função estava com um typo.
        bresenhamLine(this, x1, y1, x2, y2);
    }
    
    /** Aciona o algoritmo de Círculo com os valores dos inputs. */
    drawCircleFromInput() {
        this.resetDrawingState();
        const centerX = parseInt(document.getElementById('circleX').value);
        const centerY = parseInt(document.getElementById('circleY').value);
        const radius = parseInt(document.getElementById('circleRadius').value);
        midpointCircle(this, centerX, centerY, radius);
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