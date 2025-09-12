/**
 * @file Arquivo principal (entry point) da aplicação de Computação Gráfica.
 * - Gerencia a classe principal GraphicsCanvas.
 * - Importa e utiliza os módulos de algoritmos.
 * - Inicializa a aplicação quando o HTML é carregado.
 */

// Importa os algoritmos e bibliotecas 3D
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bresenhamLine } from './algorithms/bresenham.js';
import { midpointCircle } from './algorithms/midpointCircle.js';
import { midpointEllipse } from './algorithms/ellipse.js';
import { drawBezierCurve } from './algorithms/bezier.js';
import { Polyline } from './algorithms/polyline.js';
import { Fill } from './algorithms/fill.js';
import { Transformations } from './algorithms/transformations.js';
import { Projections } from './algorithms/projections.js';

/**
 * @class ProjectionManager
 * @description Classe para gerenciar a cena 3D, a lógica de projeção e a visualização interativa.
 */
class ProjectionManager {
    constructor(containerId, pointsInputId, edgesInputId) {
        this.container = document.getElementById(containerId);
        this.pointsInput = document.getElementById(pointsInputId);
        this.edgesInput = document.getElementById(edgesInputId);

        // Estado da visualização
        this.isInitialized = false;
        this.animationFrameId = null;

        // Componentes do Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objectGroup = null; // Grupo para conter o objeto (vértices e arestas)
        this.viewGroup = new THREE.Group(); // Grupo para controlar a visualização (rotação/shear)
    }

    // Inicializa a cena 3D pela primeira vez
    init() {
        if (this.isInitialized) return;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // Usaremos uma câmera ortográfica para a visualização, pois ela não distorce
        // as proporções, o que é melhor para simular as projeções.
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.OrthographicCamera(-15 * aspect, 15 * aspect, 15, -15, 0.1, 1000);
        this.camera.position.set(0, 0, 50); // Posição fixa da câmera
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.container.appendChild(this.renderer.domElement);
        
        // O objectGroup contém a geometria pura
        this.objectGroup = new THREE.Group();
        // O viewGroup é o que rotacionamos ou cisalhamos para a visualização
        this.viewGroup.add(this.objectGroup);
        this.scene.add(this.viewGroup);

        const gridHelper = new THREE.GridHelper(20, 20);
        gridHelper.rotation.x = Math.PI / 2; // Gira a grade para o plano XY
        this.scene.add(gridHelper);
        const axesHelper = new THREE.AxesHelper(10);
        this.scene.add(axesHelper);

        this.isInitialized = true;
    }

    start() {
        if (!this.isInitialized) this.init();
        this.resize();
        this.updateObjectAndPose();
        this.animate();
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
    
    resize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const aspect = width / height;
        
        this.camera.left = -15 * aspect;
        this.camera.right = 15 * aspect;
        this.camera.top = 15;
        this.camera.bottom = -15;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    parsePoints() {
        const lines = this.pointsInput.value.trim().split('\n');
        return lines.map(line => {
            const [x, y, z] = line.split(',').map(Number);
            return { x, y, z };
        }).filter(p => !isNaN(p.x) && !isNaN(p.y) && !isNaN(p.z));
    }

    parseEdges() {
        const lines = this.edgesInput.value.trim().split('\n');
        return lines.map(line => {
            return line.split(',').map(Number);
        }).filter(e => e.length === 2 && !isNaN(e[0]) && !isNaN(e[1]));
    }
    
    updateObjectAndPose() {
        if (!this.isInitialized) return;

        // 1. Atualiza a geometria (vértices e arestas)
        this.points3D = this.parsePoints();
        this.edges = this.parseEdges();
        
        while (this.objectGroup.children.length > 0) {
            this.objectGroup.remove(this.objectGroup.children[0]);
        }
        
        const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x007bff });
        this.points3D.forEach(p => {
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(p.x, p.y, p.z);
            this.objectGroup.add(sphere);
        });

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });
        this.edges.forEach(edge => {
            const p1 = this.points3D[edge[0]];
            const p2 = this.points3D[edge[1]];
            if (p1 && p2) {
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(p1.x, p1.y, p1.z),
                    new THREE.Vector3(p2.x, p2.y, p2.z)
                ]);
                const line = new THREE.Line(geometry, lineMaterial);
                this.objectGroup.add(line);
            }
        });
        
        // 2. Atualiza a pose (rotação/shear) da visualização
        this.updateViewFromInputs();
    }
    
    // Este método agora controla a "câmera virtual" manipulando o objeto
    updateViewFromInputs() {
        if (!this.isInitialized) return;

        // Reseta a transformação do grupo de visualização
        this.viewGroup.rotation.set(0, 0, 0);
        this.viewGroup.position.set(0, 0, 0);
        this.viewGroup.scale.set(1, 1, 1);
        this.viewGroup.updateMatrix(); // Aplica o reset
        
        const type = document.getElementById('projectionType').value;
        
        if (type === 'orthographic' || type === 'perspective') {
            const theta = parseFloat(document.getElementById('projectionTheta').value) || 0;
            const phi = parseFloat(document.getElementById('projectionPhi').value) || 0;
            
            // Rotacionamos o grupo para simular a visão da câmera
            this.viewGroup.rotation.y = THREE.MathUtils.degToRad(theta);
            this.viewGroup.rotation.x = THREE.MathUtils.degToRad(phi);

            if (type === 'perspective') {
                const d = parseFloat(document.getElementById('projectionD').value) || 20;
                // Simula o encolhimento da perspectiva
                const scale = d / (d + 10); // Usa uma profundidade média para o fator de escala
                this.viewGroup.scale.set(scale, scale, scale);
            }

        } else if (type === 'cavalier' || type === 'cabinet') {
            const alpha = parseFloat(document.getElementById('projectionAlpha').value) || 45;
            const alphaRad = THREE.MathUtils.degToRad(alpha);
            
            // Fator L para projeções oblíquas
            const L = (type === 'cabinet') ? 0.5 : 1;
            
            // Cria uma matriz de cisalhamento (shear)
            const shearMatrix = new THREE.Matrix4().set(
                1, 0, L * Math.cos(alphaRad), 0,
                0, 1, L * Math.sin(alphaRad), 0,
                0, 0, 1,                     0,
                0, 0, 0,                     1
            );
            
            // Aplica a matriz de cisalhamento ao grupo de visualização
            this.viewGroup.applyMatrix4(shearMatrix);
        }
    }

    getPoints() {
        return this.points3D || [];
    }
    
    getEdges() {
        return this.edges || [];
    }
}


/**
 * @class GraphicsCanvas
 * @description Classe principal que encapsula toda a lógica e estado do canvas.
 */
class GraphicsCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.gridSize = 20;
        this.showGrid = true;
        this.gridWidth = 40;
        this.gridHeight = 30;
        this.scrollContainer = null;
        this.scrollX = 0;
        this.scrollY = 0;
        this.zoomLevel = 1.0;
        this.minZoom = 0.25;
        this.maxZoom = 4.0;
        this.zoomStep = 0.1;
        this.baseGridSize = 20;
        this.drawColor = '#ff0000';
        this.drawingState = { mode: null, points: [] };
        this.savedDrawings = [];
        this.lastPolygon = null;
        
        // Gerenciador de Projeção
        this.projectionManager = new ProjectionManager('3d-viewer', '3dPointsInput', '3dEdgesInput');
        this.projectionModal = new bootstrap.Modal(document.getElementById('projectionModal'));
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollSystem();
        this.resizeCanvas();
        this.updateInputLimits();
        document.getElementById('currentPixelSize').textContent = this.gridSize;
        this.updateZoomInfo();
        this.redrawCanvas();
    }

    setupEventListeners() {
        // Eventos do Canvas 2D
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleCanvasDblClick(e));
        this.canvas.addEventListener('wheel', (e) => this.handleMouseWheel(e));

        // Controles Gerais
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('toggleGrid').addEventListener('click', () => this.toggleGrid());
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoomReset').addEventListener('click', () => this.zoomReset());

        // Algoritmos de Desenho
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

        // Transformações
        document.getElementById('applyTransform').addEventListener('click', () => this.applyTransform());
        document.getElementById('transformType').addEventListener('change', (e) => this.handleTransformTypeChange(e));

        // Configurações
        document.getElementById('drawColor').addEventListener('change', (e) => { this.drawColor = e.target.value; });
        document.getElementById('gridWidth').addEventListener('input', (e) => {
            document.getElementById('gridWidthValue').textContent = e.target.value;
            this.previewGridSize();
        });
        document.getElementById('gridHeight').addEventListener('input', (e) => {
            document.getElementById('gridHeightValue').textContent = e.target.value;
            this.previewGridSize();
        });
        document.getElementById('applyGridSize').addEventListener('click', () => this.applyGridSize());
        
        // Eventos de Projeção 3D
        document.getElementById('openProjectionModal').addEventListener('click', () => this.projectionModal.show());
        const projectionModalEl = document.getElementById('projectionModal');
        
        projectionModalEl.addEventListener('shown.bs.modal', () => {
            this.projectionManager.start();
        });
        projectionModalEl.addEventListener('hide.bs.modal', () => {
            this.projectionManager.stop();
        });
        
        document.getElementById('update3DObject').addEventListener('click', () => {
            this.projectionManager.updateObjectAndPose();
        });
        document.getElementById('applyProjection').addEventListener('click', () => this.applyProjectionFromModal());

        // Adiciona listeners para atualizar a visualização 3D em tempo real
        const projectionInputs = document.querySelectorAll('#projectionType, #projectionTheta, #projectionPhi, #projectionAlpha, #projectionD');
        projectionInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.projectionManager.updateViewFromInputs();
                // Chama a mudança de inputs visíveis também
                if (input.id === 'projectionType') {
                    this.handleProjectionTypeChange({ target: input });
                }
            });
        });
    }
    
    setupScrollSystem() {
        this.scrollContainer = document.getElementById('canvasScrollContainer');
        this.scrollContainer.addEventListener('scroll', () => {
            this.scrollX = this.scrollContainer.scrollLeft;
            this.scrollY = this.scrollContainer.scrollTop;
        });
        this.centerScroll();
    }
    centerScroll() {
        if (!this.scrollContainer) return;
        const totalWidth = this.gridWidth * this.gridSize;
        const totalHeight = this.gridHeight * this.gridSize;
        const centerX = (totalWidth - this.scrollContainer.clientWidth) / 2;
        const centerY = (totalHeight - this.scrollContainer.clientHeight) / 2;
        this.scrollContainer.scrollLeft = Math.max(0, centerX);
        this.scrollContainer.scrollTop = Math.max(0, centerY);
    }
    zoomIn() { this.setZoom(this.zoomLevel + this.zoomStep); }
    zoomOut() { this.setZoom(this.zoomLevel - this.zoomStep); }
    zoomReset() { this.setZoom(1.0); }
    setZoom(newZoomLevel) {
        newZoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, newZoomLevel));
        if (newZoomLevel === this.zoomLevel) return;
        this.zoomLevel = newZoomLevel;
        this.gridSize = Math.round(this.baseGridSize * this.zoomLevel);
        this.resizeCanvas();
        this.redrawCanvas();
        this.updateZoomInfo();
        this.updateInputLimits();
    }
    updateZoomInfo() {
        const zoomInfo = document.getElementById('zoomInfo');
        if (zoomInfo) {
            zoomInfo.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }
    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.showGrid) this.drawGrid();
        this.redrawAllSavedDrawings();
    }
    redrawAllSavedDrawings() { this.savedDrawings.forEach(d => this.drawSavedDrawing(d)); }
    drawSavedDrawing(drawing) {
        if (drawing.type === 'line') bresenhamLine(this, drawing.x1, drawing.y1, drawing.x2, drawing.y2, drawing.color);
        else if (drawing.type === 'circle') midpointCircle(this, drawing.centerX, drawing.centerY, drawing.radius, drawing.color);
        else if (drawing.type === 'ellipse') midpointEllipse(this, drawing.centerX, drawing.centerY, drawing.radiusX, drawing.radiusY, drawing.color);
        else if (drawing.type === 'bezier') drawBezierCurve(this, drawing.p0, drawing.p1, drawing.p2, drawing.color);
        else if (drawing.type === 'polyline') Polyline.drawPolyline(this, drawing.points, drawing.color);
        else if (drawing.type === 'polygon') Polyline.drawPolygon(this, drawing.points, drawing.color);
        else if (drawing.type === 'fill') drawing.points.forEach(p => this.drawPixel(p.x, p.y, drawing.color));
    }
    saveDrawing(drawingData) { this.savedDrawings.push(drawingData); }
    drawGrid() {
        if (!this.showGrid) return;
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const halfWidth = Math.floor(this.gridWidth / 2);
        const halfHeight = Math.floor(this.gridHeight / 2);
        for (let i = -halfWidth; i <= halfWidth; i++) {
            const x = Math.round(centerX + i * this.gridSize) + 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = -halfHeight; i <= halfHeight; i++) {
            const y = Math.round(centerY - i * this.gridSize) + 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        this.drawCoordinateNumbers();
    }
    drawCoordinateNumbers() {
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const halfWidth = Math.floor(this.gridWidth / 2);
        const halfHeight = Math.floor(this.gridHeight / 2);
        for (let i = -halfWidth; i <= halfWidth; i++) {
            if (i !== 0) this.ctx.fillText(i.toString(), centerX + i * this.gridSize, centerY - 5);
        }
        this.ctx.textAlign = 'right';
        for (let i = -halfHeight; i <= halfHeight; i++) {
            if (i !== 0) this.ctx.fillText(i.toString(), centerX - 5, centerY - i * this.gridSize + 4);
        }
    }
    screenToGrid(screenX, screenY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const gridX = Math.round((screenX - centerX) / this.gridSize);
        const gridY = Math.round((centerY - screenY) / this.gridSize);
        return { x: gridX, y: gridY };
    }
    gridToScreen(gridX, gridY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const screenX = centerX + gridX * this.gridSize;
        const screenY = centerY - gridY * this.gridSize;
        return { x: screenX, y: screenY };
    }
    drawPixel(gridX, gridY, color = null) {
        if (!this.validateCoordinates(gridX, gridY)) return;
        const screenPos = this.gridToScreen(gridX, gridY);
        const pixelSize = this.gridSize;
        this.ctx.fillStyle = color || this.drawColor;
        this.ctx.fillRect(screenPos.x - pixelSize / 2, screenPos.y - pixelSize / 2, pixelSize, pixelSize);
    }
    getPixelColor(gridX, gridY) {
        if (!this.validateCoordinates(gridX, gridY)) return null;
        const screenPos = this.gridToScreen(gridX, gridY);
        const clampedX = Math.max(0, Math.min(this.canvas.width - 1, Math.round(screenPos.x)));
        const clampedY = Math.max(0, Math.min(this.canvas.height - 1, Math.round(screenPos.y)));
        try {
            const pixelData = this.ctx.getImageData(clampedX, clampedY, 1, 1).data;
            return { r: pixelData[0], g: pixelData[1], b: pixelData[2], a: pixelData[3] };
        } catch (e) {
            console.error("Erro ao ler dados de pixel:", e);
            return { r: 255, g: 255, b: 255, a: 255 };
        }
    }
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const gridCoords = this.screenToGrid(e.clientX - rect.left, e.clientY - rect.top);
        if (this.drawingState.mode === 'line_end') {
            this.redrawCanvas();
            const startPoint = this.drawingState.points[0];
            const startScreen = this.gridToScreen(startPoint.x, startPoint.y);
            const endScreen = this.gridToScreen(gridCoords.x, gridCoords.y);
            this.ctx.strokeStyle = '#aaaaaa';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(startScreen.x, startScreen.y);
            this.ctx.lineTo(endScreen.x, endScreen.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            this.updateCoordinatesDisplay(`Ponto final: (${gridCoords.x}, ${gridCoords.y}) | Clique para finalizar.`);
        } else if (this.drawingState.mode === 'circle_radius') {
            this.redrawCanvas();
            const center = this.drawingState.points[0];
            const radius = Math.round(Math.sqrt(Math.pow(gridCoords.x - center.x, 2) + Math.pow(gridCoords.y - center.y, 2)));
            const screenPos = this.gridToScreen(center.x, center.y);
            this.ctx.strokeStyle = '#aaaaaa';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, radius * this.gridSize, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.updateCoordinatesDisplay(`Raio: ${radius} | Clique para finalizar.`);
        } else if (this.drawingState.mode === 'ellipse_rx') {
            this.redrawCanvas();
            const center = this.drawingState.points[0];
            const radiusX = Math.abs(gridCoords.x - center.x);
            const startScreen = this.gridToScreen(center.x - radiusX, center.y);
            const endScreen = this.gridToScreen(center.x + radiusX, center.y);
            this.ctx.strokeStyle = '#aaaaaa'; this.ctx.lineWidth = 1; this.ctx.beginPath(); this.ctx.moveTo(startScreen.x, startScreen.y); this.ctx.lineTo(endScreen.x, endScreen.y); this.ctx.stroke();
            this.updateCoordinatesDisplay(`Raio X: ${radiusX} | Clique para definir.`);
        } else if (this.drawingState.mode === 'ellipse_ry') {
            this.redrawCanvas();
            const center = this.drawingState.points[0];
            const radiusX = this.drawingState.points[1].x;
            const radiusY = Math.abs(gridCoords.y - center.y);
            const screenCenter = this.gridToScreen(center.x, center.y);
            this.ctx.strokeStyle = '#aaaaaa'; this.ctx.lineWidth = 1; this.ctx.beginPath(); this.ctx.ellipse(screenCenter.x, screenCenter.y, radiusX * this.gridSize, radiusY * this.gridSize, 0, 0, 2 * Math.PI); this.ctx.stroke();
            this.updateCoordinatesDisplay(`Raio Y: ${radiusY} | Clique para finalizar.`);
        } else if (this.drawingState.mode === 'polyline_draw' && this.drawingState.points.length > 0) {
            this.redrawCanvas();
            Polyline.drawPolyline(this, this.drawingState.points);
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
        } else if (!this.drawingState.mode) {
            const isValid = this.validateCoordinates(gridCoords.x, gridCoords.y);
            const status = isValid ? '' : ' (fora dos limites)';
            this.updateCoordinatesDisplay(`Coordenadas: (${gridCoords.x}, ${gridCoords.y})${status}`);
        }
    }
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const gridCoords = this.screenToGrid(e.clientX - rect.left, e.clientY - rect.top);
        if (this.drawingState.mode === 'line_start') {
            if (!this.validateCoordinates(gridCoords.x, gridCoords.y)) { this.updateCoordinatesDisplay('Erro: Ponto inicial fora dos limites!'); return; }
            this.drawingState.points.push(gridCoords);
            this.drawingState.mode = 'line_end';
            this.updateCoordinatesDisplay('Clique para definir o ponto final.');
        } else if (this.drawingState.mode === 'line_end') {
            if (!this.validateCoordinates(gridCoords.x, gridCoords.y)) { this.updateCoordinatesDisplay('Erro: Ponto final fora dos limites!'); return; }
            const startPoint = this.drawingState.points[0];
            this.saveDrawing({ type: 'line', x1: startPoint.x, y1: startPoint.y, x2: gridCoords.x, y2: gridCoords.y, color: this.drawColor });
            bresenhamLine(this, startPoint.x, startPoint.y, gridCoords.x, gridCoords.y, this.drawColor);
            this.resetDrawingState();
        } else if (this.drawingState.mode === 'circle_center') {
            if (!this.validateCoordinates(gridCoords.x, gridCoords.y)) { this.updateCoordinatesDisplay('Erro: Centro fora dos limites!'); return; }
            this.drawingState.points.push(gridCoords);
            this.drawingState.mode = 'circle_radius';
            this.updateCoordinatesDisplay('Clique para definir o raio.');
        } else if (this.drawingState.mode === 'circle_radius') {
            const center = this.drawingState.points[0];
            const radius = Math.round(Math.sqrt(Math.pow(gridCoords.x - center.x, 2) + Math.pow(gridCoords.y - center.y, 2)));
            this.saveDrawing({ type: 'circle', centerX: center.x, centerY: center.y, radius: radius, color: this.drawColor });
            midpointCircle(this, center.x, center.y, radius, this.drawColor);
            this.resetDrawingState();
        } else if (this.drawingState.mode === 'ellipse_center') {
            this.drawingState.points.push(gridCoords);
            this.drawingState.mode = 'ellipse_rx';
            this.updateCoordinatesDisplay('Clique para definir o raio X.');
        } else if (this.drawingState.mode === 'ellipse_rx') {
            const center = this.drawingState.points[0];
            const radiusX = Math.abs(gridCoords.x - center.x);
            this.drawingState.points.push({ x: radiusX });
            this.drawingState.mode = 'ellipse_ry';
            this.updateCoordinatesDisplay('Clique para definir o raio Y.');
        } else if (this.drawingState.mode === 'ellipse_ry') {
            const center = this.drawingState.points[0];
            const radiusX = this.drawingState.points[1].x;
            const radiusY = Math.abs(gridCoords.y - center.y);
            this.saveDrawing({ type: 'ellipse', centerX: center.x, centerY: center.y, radiusX, radiusY, color: this.drawColor });
            midpointEllipse(this, center.x, center.y, radiusX, radiusY, this.drawColor);
            this.resetDrawingState();
        } else if (this.drawingState.mode === 'polyline_draw') {
            if (!this.validateCoordinates(gridCoords.x, gridCoords.y)) { this.updateCoordinatesDisplay('Erro: Ponto fora dos limites!'); return; }
            this.drawingState.points.push(gridCoords);
            this.redrawCanvas();
            Polyline.drawPolyline(this, this.drawingState.points, this.drawColor);
        } else if (this.drawingState.mode === 'fill_seed_point') {
            if (!this.validateCoordinates(gridCoords.x, gridCoords.y)) { this.updateCoordinatesDisplay('Erro: Ponto semente fora dos limites!'); return; }
            const pointsToFill = Fill.floodFill(gridCoords.x, gridCoords.y, this.drawColor, this);
            if (pointsToFill.length > 0) {
                const fillDrawing = { type: 'fill', points: pointsToFill, color: this.drawColor };
                this.saveDrawing(fillDrawing);
                this.drawSavedDrawing(fillDrawing);
            }
            this.resetDrawingState();
        }
    }
    handleCanvasDblClick(e) {
        e.preventDefault();
        if (this.drawingState.mode === 'polyline_draw' && this.drawingState.points.length >= 2) {
            const finalPoints = [...this.drawingState.points];
            const drawingData = { type: 'polygon', points: finalPoints, color: this.drawColor };
            this.saveDrawing(drawingData);
            this.lastPolygon = drawingData;
            this.redrawCanvas();
            this.resetDrawingState();
        }
    }
    handleMouseWheel(e) {
        if (!e.ctrlKey) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
        this.setZoom(this.zoomLevel + delta);
    }
    handleProjectionTypeChange(event) {
        const type = event.target.value;
        document.getElementById('oblique-inputs').style.display = (type === 'cavalier' || type === 'cabinet') ? 'block' : 'none';
        document.getElementById('orthographic-perspective-inputs').style.display = (type === 'orthographic' || type === 'perspective') ? 'block' : 'none';
        document.getElementById('perspective-d-input').style.display = (type === 'perspective') ? 'block' : 'none';
    }
    clearCanvas() {
        this.savedDrawings = [];
        this.lastPolygon = null;
        this.redrawCanvas();
        this.resetDrawingState();
    }
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.redrawCanvas();
    }
    applyGridSize() {
        this.gridWidth = parseInt(document.getElementById('gridWidth').value);
        this.gridHeight = parseInt(document.getElementById('gridHeight').value);
        this.baseGridSize = 20;
        this.gridSize = Math.round(this.baseGridSize * this.zoomLevel);
        this.resizeCanvas();
        this.updateInputLimits();
        this.centerScroll();
        this.redrawCanvas();
        document.getElementById('currentPixelSize').textContent = this.gridSize;
        this.updateCoordinatesDisplay(`Grade: ${this.gridWidth}x${this.gridHeight}`);
    }
    resizeCanvas() {
        this.canvas.width = this.gridWidth * this.gridSize;
        this.canvas.height = this.gridHeight * this.gridSize;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }
    previewGridSize() {
        const previewWidth = parseInt(document.getElementById('gridWidth').value);
        const previewHeight = parseInt(document.getElementById('gridHeight').value);
        const previewPixelSize = Math.round(this.baseGridSize * this.zoomLevel);
        const totalWidth = previewWidth * previewPixelSize;
        const totalHeight = previewHeight * previewPixelSize;
        document.getElementById('currentPixelSize').textContent = `${previewPixelSize}px (${totalWidth}x${totalHeight}px)`;
    }
    updateInputLimits() {
        const halfWidth = Math.floor(this.gridWidth / 2);
        const halfHeight = Math.floor(this.gridHeight / 2);
        ['x1', 'y1', 'x2', 'y2', 'circleX', 'circleY', 'ellipseX', 'ellipseY', 'seedX', 'seedY'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                if (id.includes('X') || id.startsWith('x')) { input.max = halfWidth; input.min = -halfWidth; } 
                else { input.max = halfHeight; input.min = -halfHeight; }
            }
        });
        const radiusInput = document.getElementById('circleRadius');
        if (radiusInput) { radiusInput.max = Math.min(halfWidth, halfHeight); radiusInput.min = 1; }
    }
    resetDrawingState() {
        this.drawingState.mode = null;
        this.drawingState.points = [];
        this.updateCoordinatesDisplay('Passe o mouse sobre o canvas.');
    }
    updateCoordinatesDisplay(message) { document.getElementById('coordinatesDisplay').textContent = message; }
    validateCoordinates(x, y) {
        const halfWidth = Math.floor(this.gridWidth / 2);
        const halfHeight = Math.floor(this.gridHeight / 2);
        return x >= -halfWidth && x <= halfWidth && y >= -halfHeight && y <= halfHeight;
    }
    drawLineFromInput() {
        this.resetDrawingState();
        const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map(id => parseInt(document.getElementById(id).value));
        if (!this.validateCoordinates(x1, y1) || !this.validateCoordinates(x2, y2)) { this.updateCoordinatesDisplay('Erro: Coordenadas fora dos limites!'); return; }
        this.saveDrawing({ type: 'line', x1, y1, x2, y2, color: this.drawColor });
        bresenhamLine(this, x1, y1, x2, y2, this.drawColor);
    }
    startInteractiveLineDraw() {
        this.resetDrawingState();
        this.drawingState.mode = 'line_start';
        this.updateCoordinatesDisplay('Clique para definir o ponto inicial.');
    }
    drawCircleFromInput() {
        this.resetDrawingState();
        const centerX = parseInt(document.getElementById('circleX').value);
        const centerY = parseInt(document.getElementById('circleY').value);
        const radius = parseInt(document.getElementById('circleRadius').value);
        if (!this.validateCoordinates(centerX, centerY)) { this.updateCoordinatesDisplay('Erro: Centro fora dos limites!'); return; }
        this.saveDrawing({ type: 'circle', centerX, centerY, radius, color: this.drawColor });
        midpointCircle(this, centerX, centerY, radius, this.drawColor);
    }
    startInteractiveCircleDraw() {
        this.resetDrawingState();
        this.drawingState.mode = 'circle_center';
        this.updateCoordinatesDisplay('Clique para definir o centro.');
    }
    drawEllipseFromInput() {
        this.resetDrawingState();
        const centerX = parseInt(document.getElementById('ellipseX').value);
        const centerY = parseInt(document.getElementById('ellipseY').value);
        const radiusX = parseInt(document.getElementById('ellipseA').value);
        const radiusY = parseInt(document.getElementById('ellipseB').value);
        this.saveDrawing({ type: 'ellipse', centerX, centerY, radiusX, radiusY, color: this.drawColor });
        midpointEllipse(this, centerX, centerY, radiusX, radiusY, this.drawColor);
    }
    startInteractiveEllipseDraw() {
        this.resetDrawingState();
        this.drawingState.mode = 'ellipse_center';
        this.updateCoordinatesDisplay('Clique para definir o centro da elipse.');
    }
    drawBezierFromInput() {
        this.resetDrawingState();
        const p0 = { x: parseInt(document.getElementById('bezierP0x').value), y: parseInt(document.getElementById('bezierP0y').value) };
        const p1 = { x: parseInt(document.getElementById('bezierP1x').value), y: parseInt(document.getElementById('bezierP1y').value) };
        const p2 = { x: parseInt(document.getElementById('bezierP2x').value), y: parseInt(document.getElementById('bezierP2y').value) };
        this.saveDrawing({ type: 'bezier', p0, p1, p2, color: this.drawColor });
        drawBezierCurve(this, p0, p1, p2, this.drawColor);
    }
    drawPolylineFromInput() {
        this.resetDrawingState();
        const pointsStr = document.getElementById('polylinePoints').value.trim();
        const pairs = pointsStr.split(',').map(p => p.trim());
        if (pairs.length % 2 !== 0 || pairs.length === 0) { this.updateCoordinatesDisplay('Erro: Formato de pontos inválido.'); return; }
        const polylinePoints = [];
        for (let i = 0; i < pairs.length; i += 2) {
            const x = parseInt(pairs[i]);
            const y = parseInt(pairs[i + 1]);
            if (isNaN(x) || isNaN(y) || !this.validateCoordinates(x, y)) { this.updateCoordinatesDisplay(`Erro: Ponto (${x},${y}) inválido.`); return; }
            polylinePoints.push({ x, y });
        }
        const drawingData = { type: 'polygon', points: polylinePoints, color: this.drawColor };
        this.saveDrawing(drawingData);
        this.lastPolygon = drawingData;
        Polyline.drawPolygon(this, polylinePoints, this.drawColor);
    }
    startInteractivePolylineDraw() {
        this.resetDrawingState();
        this.drawingState.mode = 'polyline_draw';
        this.updateCoordinatesDisplay('Clique para adicionar pontos. Duplo clique para finalizar.');
    }
    fillAreaFromInput() {
        this.resetDrawingState();
        const algorithm = document.getElementById('fillAlgorithm').value;
        const seedX = parseInt(document.getElementById('seedX').value);
        const seedY = parseInt(document.getElementById('seedY').value);
        if (algorithm === 'recursive') {
            if (!this.validateCoordinates(seedX, seedY)) { this.updateCoordinatesDisplay('Erro: Ponto semente fora dos limites!'); return; }
            const pointsToFill = Fill.floodFill(seedX, seedY, this.drawColor, this);
            if (pointsToFill.length > 0) {
                const fillDrawing = { type: 'fill', points: pointsToFill, color: this.drawColor };
                this.saveDrawing(fillDrawing);
                this.drawSavedDrawing(fillDrawing);
            }
        } else if (algorithm === 'scanline') {
            if (this.lastPolygon) Fill.scanlineFill(this.lastPolygon.points, this.drawColor, this);
            else alert('Nenhum polígono foi desenhado para preencher.');
        }
    }
    startInteractiveFill() {
        this.resetDrawingState();
        this.drawingState.mode = 'fill_seed_point';
        document.getElementById('fillAlgorithm').value = 'recursive';
        this.updateCoordinatesDisplay('Clique em uma área para preencher.');
    }
    _getShapeCentroid(points) {
        if (!points || points.length === 0) return { x: 0, y: 0 };
        const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        return { x: Math.round(sum.x / points.length), y: Math.round(sum.y / points.length) };
    }
    applyTransform() {
        const lastDrawing = this.savedDrawings.slice().reverse().find(d => d.points);
        if (!lastDrawing) { alert("Nenhum objeto transformável foi desenhado."); return; }
        const type = document.getElementById('transformType').value;
        let transformedPoints = [];
        switch (type) {
            case 'translation': {
                const dx = parseFloat(document.getElementById('translateX').value);
                const dy = parseFloat(document.getElementById('translateY').value);
                transformedPoints = Transformations.translate(lastDrawing.points, dx, dy);
                break;
            }
            case 'rotation': {
                const angle = parseFloat(document.getElementById('rotationAngle').value);
                const pivot = { x: parseFloat(document.getElementById('rotationPivotX').value), y: parseFloat(document.getElementById('rotationPivotY').value) };
                transformedPoints = Transformations.rotate(lastDrawing.points, angle, pivot);
                break;
            }
            case 'scale': {
                const sx = parseFloat(document.getElementById('scaleX').value);
                const sy = parseFloat(document.getElementById('scaleY').value);
                const center = { x: parseFloat(document.getElementById('scaleCenterX').value), y: parseFloat(document.getElementById('scaleCenterY').value) };
                transformedPoints = Transformations.scale(lastDrawing.points, sx, sy, center);
                break;
            }
        }
        if (transformedPoints.length > 0) lastDrawing.points = transformedPoints;
        this.redrawCanvas();
    }
    handleTransformTypeChange(event) {
        const selectedType = event.target.value;
        document.querySelectorAll('.transform-inputs').forEach(div => div.style.display = 'none');
        document.getElementById(`${selectedType}Inputs`).style.display = 'block';
    }
    applyProjectionFromModal() {
        const points3D = this.projectionManager.getPoints();
        const edges = this.projectionManager.getEdges();
        if (points3D.length === 0) { alert("Defina ao menos um ponto 3D."); return; }
        const type = document.getElementById('projectionType').value;
        let projectedPoints = [];
        switch (type) {
            case 'orthographic': {
                const theta = parseFloat(document.getElementById('projectionTheta').value);
                const phi = parseFloat(document.getElementById('projectionPhi').value);
                projectedPoints = Projections.orthographic(points3D, theta, phi);
                break;
            }
            case 'perspective': {
                const theta = parseFloat(document.getElementById('projectionTheta').value);
                const phi = parseFloat(document.getElementById('projectionPhi').value);
                const d = parseFloat(document.getElementById('projectionD').value);
                projectedPoints = Projections.perspective(points3D, d, theta, phi);
                break;
            }
            case 'cavalier': {
                const alpha = parseFloat(document.getElementById('projectionAlpha').value);
                projectedPoints = Projections.cavalier(points3D, alpha);
                break;
            }
            case 'cabinet': {
                const alpha = parseFloat(document.getElementById('projectionAlpha').value);
                projectedPoints = Projections.cabinet(points3D, alpha);
                break;
            }
        }
        this.redrawCanvas();
        edges.forEach(edge => {
            const p1 = projectedPoints[edge[0]];
            const p2 = projectedPoints[edge[1]];
            if (p1 && p2) {
                const [x1, y1, x2, y2] = [Math.round(p1.x), Math.round(p1.y), Math.round(p2.x), Math.round(p2.y)];
                this.saveDrawing({ type: 'line', x1, y1, x2, y2, color: this.drawColor });
                bresenhamLine(this, x1, y1, x2, y2, this.drawColor);
            }
        });
        this.projectionModal.hide();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GraphicsCanvas('drawingCanvas');
});