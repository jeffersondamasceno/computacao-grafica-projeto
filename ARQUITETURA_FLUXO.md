# Arquitetura e Fluxo do Sistema - Computação Gráfica

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACE HTML                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Controles     │  │   Canvas 2D     │  │ Modal 3D    │  │
│  │   (Bootstrap)   │  │   (HTML5)       │  │ (Three.js)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 GRAPHICS CANVAS CLASS                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Event Listeners│  │  Drawing State  │  │  Projection │  │
│  │  - Click        │  │  - Mode         │  │  Manager    │  │
│  │  - Mouse Move   │  │  - Points       │  │  - 3D Scene │  │
│  │  - Wheel        │  │  - Color        │  │  - Controls │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ALGORITHMS MODULES                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │  Bresenham  │ │  Midpoint   │ │   Ellipse   │ │  Bezier │ │
│  │  (Lines)    │ │  (Circles)  │ │             │ │ (Curves)│ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │  Polyline   │ │    Fill     │ │Transformations│ │Projections│ │
│  │             │ │             │ │             │ │         │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RENDERING LAYER                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Grid System   │  │   Pixel Drawing │  │  Coordinate │  │
│  │   - Draw Grid   │  │   - drawPixel() │  │  Conversion │  │
│  │   - Numbers     │  │   - Colors      │  │  - Screen   │  │
│  │   - Zoom        │  │   - Validation  │  │  - Grid     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo Detalhado - Algoritmo de Bresenham

### 1. **Inicialização do Sistema**
```
DOMContentLoaded Event
        │
        ▼
new GraphicsCanvas('drawingCanvas')
        │
        ▼
┌─────────────────────────────────┐
│         init()                  │
│  - setupEventListeners()        │
│  - setupScrollSystem()          │
│  - resizeCanvas()               │
│  - redrawCanvas()               │
└─────────────────────────────────┘
```

### 2. **Fluxo de Desenho de Linha (Modo Input)**
```
Usuário preenche campos x1, y1, x2, y2
        │
        ▼
Clica em "Desenhar via Input"
        │
        ▼
┌─────────────────────────────────┐
│    drawLineFromInput()          │
│  - resetDrawingState()          │
│  - Lê valores dos inputs        │
│  - validateCoordinates()        │
│  - saveDrawing()                │
│  - bresenhamLine()              │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│     bresenhamLine()             │
│  - Calcula dx, dy, sx, sy       │
│  - Inicializa err = dx - dy     │
│  - Loop while(true):            │
│    - drawPixel(x0, y0, color)   │
│    - Calcula e2 = 2 * err       │
│    - Atualiza x0, y0, err       │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│      drawPixel()                │
│  - validateCoordinates()        │
│  - gridToScreen()               │
│  - ctx.fillRect()               │
└─────────────────────────────────┘
```

### 3. **Fluxo de Desenho de Linha (Modo Interativo)**
```
Clica em "Desenhar Interativo"
        │
        ▼
┌─────────────────────────────────┐
│  startInteractiveLineDraw()     │
│  - resetDrawingState()          │
│  - drawingState.mode = 'line_start' │
│  - updateCoordinatesDisplay()   │
└─────────────────────────────────┘
        │
        ▼
Usuário clica no canvas (ponto inicial)
        │
        ▼
┌─────────────────────────────────┐
│    handleCanvasClick()          │
│  - screenToGrid()               │
│  - validateCoordinates()        │
│  - drawingState.points.push()   │
│  - drawingState.mode = 'line_end' │
└─────────────────────────────────┘
        │
        ▼
Usuário move mouse (preview)
        │
        ▼
┌─────────────────────────────────┐
│    handleMouseMove()            │
│  - redrawCanvas()               │
│  - Desenha linha tracejada      │
│  - updateCoordinatesDisplay()   │
└─────────────────────────────────┘
        │
        ▼
Usuário clica no canvas (ponto final)
        │
        ▼
┌─────────────────────────────────┐
│    handleCanvasClick()          │
│  - validateCoordinates()        │
│  - saveDrawing()                │
│  - bresenhamLine()              │
│  - resetDrawingState()          │
└─────────────────────────────────┘
```

## 🎯 Fluxo de Outros Algoritmos

### **Círculos (Midpoint Circle)**
```
drawCircleFromInput() → midpointCircle() → drawCirclePoints() → drawPixel()
```

### **Elipses (Midpoint Ellipse)**
```
drawEllipseFromInput() → midpointEllipse() → drawEllipsePoints() → drawPixel()
```

### **Curvas de Bézier**
```
drawBezierFromInput() → drawBezierCurve() → drawPixel() (interpolação)
```

### **Preenchimento (Flood Fill)**
```
fillAreaFromInput() → Fill.floodFill() → drawPixel() (recursivo)
```

### **Transformações 2D**
```
applyTransform() → Transformations.* → Atualiza savedDrawings → redrawCanvas()
```

### **Projeções 3D**
```
openProjectionModal() → ProjectionManager → Projections.* → bresenhamLine()
```

## 🔧 Sistema de Coordenadas

### **Conversão de Coordenadas**
```
Coordenadas da Tela (pixels)
        │
        ▼
┌─────────────────────────────────┐
│      screenToGrid()             │
│  - centerX = canvas.width/2     │
│  - centerY = canvas.height/2    │
│  - gridX = (screenX - centerX) / gridSize │
│  - gridY = (centerY - screenY) / gridSize │
└─────────────────────────────────┘
        │
        ▼
Coordenadas da Malha (unidades)
        │
        ▼
┌─────────────────────────────────┐
│      gridToScreen()             │
│  - screenX = centerX + gridX * gridSize │
│  - screenY = centerY - gridY * gridSize │
└─────────────────────────────────┘
        │
        ▼
Coordenadas da Tela (pixels)
```

## 📊 Gerenciamento de Estado

### **Estrutura de Dados**
```javascript
// Estado principal da aplicação
{
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  showGrid: boolean,
  zoomLevel: number,
  drawColor: string,
  drawingState: {
    mode: string | null,
    points: Array<{x: number, y: number}>
  },
  savedDrawings: Array<{
    type: string,
    x1?: number, y1?: number, x2?: number, y2?: number,
    centerX?: number, centerY?: number, radius?: number,
    points?: Array<{x: number, y: number}>,
    color: string
  }>
}
```

### **Ciclo de Vida dos Desenhos**
```
1. Usuário inicia desenho
2. drawingState.mode = 'tipo_desenho'
3. Usuário fornece pontos (cliques/inputs)
4. drawingState.points.push(coordenadas)
5. Algoritmo processa pontos
6. saveDrawing() adiciona ao savedDrawings[]
7. drawPixel() renderiza na tela
8. resetDrawingState() limpa estado temporário
```

## 🎨 Sistema de Renderização

### **Pipeline de Desenho**
```
1. clearRect() - Limpa canvas
2. drawGrid() - Desenha malha (se habilitada)
3. redrawAllSavedDrawings() - Re-desenha todos os desenhos salvos
4. drawSavedDrawing() - Para cada desenho salvo
5. Chama algoritmo específico (bresenhamLine, midpointCircle, etc.)
6. drawPixel() - Renderiza pixel individual
```

### **Otimizações**
- **Redraw seletivo**: Só redesenha quando necessário
- **Validação de coordenadas**: Evita desenhar fora dos limites
- **Sistema de zoom**: Escala pixels proporcionalmente
- **Scroll**: Permite navegar por malhas grandes
- **Cores**: Sistema unificado de cores

## 🔄 Event Loop

### **Eventos Principais**
```
Mouse Events:
├── mousemove → handleMouseMove() → preview/interação
├── click → handleCanvasClick() → desenho interativo
└── dblclick → handleCanvasDblClick() → finalizar polilinha

UI Events:
├── input change → validação em tempo real
├── button click → execução de algoritmos
└── wheel → handleMouseWheel() → zoom

System Events:
├── resize → resizeCanvas() → ajustar tamanho
└── scroll → setupScrollSystem() → navegação
```

## 🚀 Pontos de Extensão

### **Adicionar Novo Algoritmo**
1. Criar arquivo em `algorithms/`
2. Exportar função principal
3. Importar em `main.js`
4. Adicionar botão no HTML
5. Adicionar event listener
6. Implementar função de desenho
7. Adicionar ao `drawSavedDrawing()`

### **Adicionar Nova Transformação**
1. Implementar em `algorithms/transformations.js`
2. Adicionar opção no select
3. Adicionar inputs específicos
4. Implementar case no `applyTransform()`

### **Adicionar Nova Projeção 3D**
1. Implementar em `algorithms/projections.js`
2. Adicionar opção no select
3. Adicionar inputs específicos
4. Implementar case no `applyProjectionFromModal()`
