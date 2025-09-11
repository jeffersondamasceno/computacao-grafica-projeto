# Exemplos de Demonstração - Computação Gráfica

## 🎯 Cenários de Teste para Apresentação

### **1. Algoritmo de Bresenham - Linhas**

#### **Cenário 1: Linha Simples (Diagonal)**
```
Input: x1=0, y1=0, x2=10, y2=10
Fluxo:
1. Usuário preenche campos
2. Clica "Desenhar via Input"
3. drawLineFromInput() é chamada
4. Validação: validateCoordinates(0,0) ✓, validateCoordinates(10,10) ✓
5. saveDrawing() salva: {type: 'line', x1: 0, y1: 0, x2: 10, y2: 10, color: '#ff0000'}
6. bresenhamLine(graphics, 0, 0, 10, 10, '#ff0000')
7. Algoritmo calcula pixels: (0,0), (1,1), (2,2), ..., (10,10)
8. drawPixel() renderiza cada pixel
9. Linha diagonal aparece na tela
```

#### **Cenário 2: Linha Vertical**
```
Input: x1=0, y1=0, x2=0, y2=15
Resultado: Linha vertical do centro até o topo
```

#### **Cenário 3: Linha Horizontal**
```
Input: x1=0, y1=0, x2=20, y2=0
Resultado: Linha horizontal do centro para a direita
```

#### **Cenário 4: Modo Interativo**
```
1. Clica "Desenhar Interativo"
2. drawingState.mode = 'line_start'
3. Clica em (5,5) - ponto inicial
4. drawingState.points = [{x: 5, y: 5}]
5. drawingState.mode = 'line_end'
6. Move mouse - preview da linha
7. Clica em (15,5) - ponto final
8. bresenhamLine(graphics, 5, 5, 15, 5, '#ff0000')
9. Linha horizontal aparece
```

### **2. Algoritmo do Ponto Médio - Círculos**

#### **Cenário 1: Círculo Central**
```
Input: centerX=0, centerY=0, radius=8
Fluxo:
1. drawCircleFromInput() é chamada
2. Validação: validateCoordinates(0,0) ✓
3. saveDrawing() salva: {type: 'circle', centerX: 0, centerY: 0, radius: 8, color: '#ff0000'}
4. midpointCircle(graphics, 0, 0, 8, '#ff0000')
5. Algoritmo calcula pontos usando simetria de 8
6. drawCirclePoints() desenha 8 pontos por iteração
7. Círculo perfeito aparece na tela
```

#### **Cenário 2: Círculo Deslocado**
```
Input: centerX=10, centerY=5, radius=6
Resultado: Círculo com centro em (10,5) e raio 6
```

### **3. Algoritmo do Ponto Médio - Elipses**

#### **Cenário 1: Elipse Horizontal**
```
Input: centerX=0, centerY=0, radiusX=10, radiusY=5
Fluxo:
1. drawEllipseFromInput() é chamada
2. midpointEllipse(graphics, 0, 0, 10, 5, '#ff0000')
3. Algoritmo divide em duas regiões
4. Região 1: de (0,5) até inclinação -1
5. Região 2: continua até (10,0)
6. drawEllipsePoints() desenha 4 pontos por iteração
7. Elipse horizontal aparece
```

### **4. Curvas de Bézier**

#### **Cenário 1: Curva Simples**
```
Input: P0(10,10), P1(-10,0), P2(10,-10)
Fluxo:
1. drawBezierFromInput() é chamada
2. drawBezierCurve(graphics, P0, P1, P2, '#ff0000')
3. Algoritmo interpola entre pontos de controle
4. Calcula pontos da curva usando fórmula de Bézier
5. drawPixel() para cada ponto calculado
6. Curva suave aparece conectando P0 e P2
```

### **5. Sistema de Preenchimento**

#### **Cenário 1: Flood Fill Recursivo**
```
Pré-requisito: Desenhar um polígono fechado
1. Clica "Preencher Interativo"
2. drawingState.mode = 'fill_seed_point'
3. Clica dentro do polígono (ex: 0,0)
4. Fill.floodFill(0, 0, '#ff0000', graphics)
5. Algoritmo recursivo preenche área
6. drawPixel() para cada pixel preenchido
7. Área interna fica colorida
```

#### **Cenário 2: Scanline Fill**
```
Pré-requisito: Ter um polígono desenhado (lastPolygon)
1. Seleciona "Varredura (Scanline)" no algoritmo
2. Clica "Preencher Área"
3. Fill.scanlineFill(lastPolygon.points, '#ff0000', graphics)
4. Algoritmo de varredura preenche linha por linha
5. Mais eficiente que flood fill
```

### **6. Transformações 2D**

#### **Cenário 1: Translação**
```
Pré-requisito: Desenhar um polígono
1. Seleciona "Translação"
2. Input: dx=5, dy=5
3. Clica "Aplicar ao Último Desenho"
4. Transformations.translate(points, 5, 5)
5. Atualiza lastDrawing.points
6. redrawCanvas() re-renderiza
7. Polígono move 5 unidades para direita e cima
```

#### **Cenário 2: Rotação**
```
Pré-requisito: Desenhar um retângulo
1. Seleciona "Rotação"
2. Input: ângulo=45°, pivô=(0,0)
3. Clica "Aplicar ao Último Desenho"
4. Transformations.rotate(points, 45, {x:0, y:0})
5. Retângulo gira 45° em torno da origem
```

#### **Cenário 3: Escala**
```
Pré-requisito: Desenhar um triângulo
1. Seleciona "Escala"
2. Input: sx=2, sy=2, centro=(0,0)
3. Clica "Aplicar ao Último Desenho"
4. Transformations.scale(points, 2, 2, {x:0, y:0})
5. Triângulo dobra de tamanho
```

### **7. Projeções 3D**

#### **Cenário 1: Cubo com Projeção Ortogonal**
```
1. Clica "Abrir Editor de Projeção"
2. Modal abre com visualização 3D
3. Vértices padrão: cubo 10x10x10
4. Arestas: conectam vértices do cubo
5. Seleciona "Ortogonal"
6. Input: θ=30°, φ=45°
7. Clica "Aplicar Projeção no Canvas 2D"
8. Projections.orthographic(points3D, 30, 45)
9. Cubo projetado aparece no canvas 2D
```

#### **Cenário 2: Projeção Perspectiva**
```
1. Seleciona "Perspectiva"
2. Input: θ=30°, φ=45°, d=20
3. Projections.perspective(points3D, 20, 30, 45)
4. Cubo com efeito de perspectiva
```

## 🚨 Cenários de Erro para Demonstrar

### **1. Coordenadas Fora dos Limites**
```
Input: x1=50, y1=50 (fora da malha 40x30)
Resultado: "Erro: Coordenadas fora dos limites!"
```

### **2. Raio Zero ou Negativo**
```
Input: radius=-5
Resultado: Círculo não aparece ou aparece incorreto
```

### **3. Área de Preenchimento Sem Bordas**
```
Clica "Preencher Interativo" em área vazia
Resultado: Nada acontece (não há bordas para delimitar)
```

## 📊 Sequência de Demonstração Recomendada

### **Fase 1: Algoritmos Básicos (5 min)**
1. **Bresenham**: Linha diagonal (0,0)→(10,10)
2. **Bresenham**: Modo interativo - linha horizontal
3. **Midpoint Circle**: Círculo central raio 8
4. **Midpoint Ellipse**: Elipse 10x5

### **Fase 2: Algoritmos Avançados (3 min)**
1. **Bézier**: Curva com 3 pontos de controle
2. **Polilinha**: Triângulo interativo
3. **Preenchimento**: Flood fill no triângulo

### **Fase 3: Transformações (3 min)**
1. **Translação**: Mover triângulo
2. **Rotação**: Girar 45°
3. **Escala**: Dobrar tamanho

### **Fase 4: Projeções 3D (3 min)**
1. **Cubo Ortogonal**: θ=30°, φ=45°
2. **Cubo Perspectiva**: d=20
3. **Cavalier**: α=45°

### **Fase 5: Aspectos Técnicos (2 min)**
1. **Zoom**: Ctrl+scroll
2. **Grid**: Toggle on/off
3. **Cores**: Mudar cor de desenho
4. **Limpar**: Reset completo

## 🎬 Dicas para Cada Cenário

### **Bresenham**
- **Destaque**: Eficiência com apenas operações inteiras
- **Mostre**: Como o algoritmo escolhe o próximo pixel
- **Explique**: Parâmetro de decisão `err`

### **Círculos**
- **Destaque**: Simetria de 8 pontos
- **Mostre**: Como um octante gera o círculo completo
- **Explique**: Parâmetro de decisão `p`

### **Elipses**
- **Destaque**: Duas regiões diferentes
- **Mostre**: Transição entre região 1 e 2
- **Explique**: Por que precisa de duas regiões

### **Bézier**
- **Destaque**: Suavidade da curva
- **Mostre**: Como os pontos de controle influenciam
- **Explique**: Interpolação paramétrica

### **Preenchimento**
- **Destaque**: Diferença entre flood fill e scanline
- **Mostre**: Como o algoritmo "espalha" a cor
- **Explique**: Recursão vs. iteração

### **Transformações**
- **Destaque**: Matrizes de transformação
- **Mostre**: Como as coordenadas mudam
- **Explique**: Ponto de pivô/centro

### **Projeções 3D**
- **Destaque**: Visualização 3D em tempo real
- **Mostre**: Como a projeção muda com ângulos
- **Explique**: Diferença entre ortogonal e perspectiva
