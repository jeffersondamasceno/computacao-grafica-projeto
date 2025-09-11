# Roteiro de Apresentação - Projeto de Computação Gráfica

## 🎯 Objetivo da Apresentação
Demonstrar o funcionamento de algoritmos fundamentais de computação gráfica através de uma aplicação web interativa, mostrando o fluxo completo desde a interface do usuário até a renderização na malha.

---

## 📋 Estrutura da Apresentação (15-20 minutos)

### 1. **Introdução e Visão Geral** (2-3 min)
- **Contexto**: Disciplina de Computação Gráfica
- **Objetivo**: Implementação de algoritmos clássicos de rasterização
- **Tecnologias**: HTML5 Canvas, JavaScript ES6, Three.js para visualização 3D
- **Demonstração rápida**: Mostrar a interface e funcionalidades principais

### 2. **Arquitetura do Sistema** (3-4 min)
- **Estrutura modular**: Cada algoritmo em arquivo separado
- **Classe principal**: `GraphicsCanvas` - gerencia estado e renderização
- **Sistema de coordenadas**: Malha centralizada com origem em (0,0)
- **Fluxo de dados**: Interface → Validação → Algoritmo → Renderização

### 3. **Demonstração Prática - Algoritmo de Bresenham** (5-6 min)

#### 3.1 **Preparação**
- Abrir a seção "Bresenham (Linhas)" no painel lateral
- Explicar os parâmetros: ponto inicial (x1,y1) e ponto final (x2,y2)

#### 3.2 **Fluxo de Execução Detalhado**
```
1. Usuário clica em "Desenhar via Input"
   ↓
2. Event listener aciona: drawLineFromInput()
   ↓
3. Validação de coordenadas: validateCoordinates()
   ↓
4. Salvamento do desenho: saveDrawing()
   ↓
5. Chamada do algoritmo: bresenhamLine(graphics, x1, y1, x2, y2, color)
   ↓
6. Algoritmo calcula pixels: while loop com decisão de erro
   ↓
7. Renderização: graphics.drawPixel(x, y, color)
   ↓
8. Atualização visual: redrawCanvas()
```

#### 3.3 **Explicação do Algoritmo**
- **Conceito**: Algoritmo eficiente para desenhar linhas usando apenas operações inteiras
- **Parâmetro de decisão**: `err = dx - dy`
- **Critério de escolha**: `e2 = 2 * err`
- **Demonstração visual**: Mostrar como os pixels são escolhidos

#### 3.4 **Modo Interativo**
- Clicar em "Desenhar Interativo"
- Mostrar o fluxo: `startInteractiveLineDraw()` → `handleCanvasClick()` → `bresenhamLine()`

### 4. **Outros Algoritmos - Visão Geral** (3-4 min)

#### 4.1 **Círculos (Midpoint Circle)**
- **Fluxo**: `drawCircleFromInput()` → `midpointCircle()`
- **Conceito**: Simetria de 8 pontos, parâmetro de decisão `p`
- **Demonstração rápida**: Círculo com raio 10

#### 4.2 **Elipses (Midpoint Ellipse)**
- **Fluxo**: `drawEllipseFromInput()` → `midpointEllipse()`
- **Conceito**: Duas regiões, semi-eixos diferentes
- **Demonstração rápida**: Elipse 8x4

#### 4.3 **Curvas de Bézier**
- **Fluxo**: `drawBezierFromInput()` → `drawBezierCurve()`
- **Conceito**: Pontos de controle, interpolação paramétrica
- **Demonstração rápida**: Curva com 3 pontos

### 5. **Funcionalidades Avançadas** (3-4 min)

#### 5.1 **Sistema de Preenchimento**
- **Flood Fill**: `Fill.floodFill()` - recursivo
- **Scanline**: `Fill.scanlineFill()` - eficiente
- **Demonstração**: Preencher polígono

#### 5.2 **Transformações 2D**
- **Translação**: `Transformations.translate()`
- **Rotação**: `Transformations.rotate()`
- **Escala**: `Transformations.scale()`
- **Demonstração**: Aplicar transformação ao último desenho

#### 5.3 **Projeções 3D**
- **Visualização**: Three.js para preview 3D
- **Projeções**: Ortogonal, Perspectiva, Cavalier, Cabinet
- **Fluxo**: `ProjectionManager` → `Projections.*` → `bresenhamLine()`

### 6. **Aspectos Técnicos** (2-3 min)

#### 6.1 **Sistema de Coordenadas**
- Malha centralizada com origem em (0,0)
- Conversão: `screenToGrid()` e `gridToScreen()`
- Validação de limites: `validateCoordinates()`

#### 6.2 **Gerenciamento de Estado**
- `savedDrawings[]`: Array de desenhos persistentes
- `drawingState`: Estado do desenho interativo
- `redrawCanvas()`: Re-renderização completa

#### 6.3 **Otimizações**
- Zoom e scroll para visualização
- Grid adaptativo
- Cores personalizáveis

### 7. **Conclusão e Limitações** (1-2 min)
- **Algoritmos implementados**: 7 algoritmos fundamentais
- **Funcionalidades**: Interface interativa, transformações, projeções 3D
- **Limitações conhecidas**: 
  - Performance com muitos desenhos
  - Alguns algoritmos podem ter pequenos erros de precisão
  - Interface poderia ser mais intuitiva
- **Melhorias futuras**: Mais algoritmos, interface mais polida

---

## 🎬 Dicas para Gravação

### **Preparação**
1. **Teste todos os fluxos** antes de gravar
2. **Prepare exemplos específicos** para cada algoritmo
3. **Configure a resolução** da tela adequadamente
4. **Feche aplicações desnecessárias** para evitar travamentos

### **Durante a Gravação**
1. **Fale pausadamente** e explique cada passo
2. **Use o cursor** para destacar elementos na tela
3. **Demonstre tanto o modo input quanto interativo**
4. **Mostre erros de validação** (coordenadas fora dos limites)
5. **Explique o código** quando relevante

### **Estrutura do Vídeo**
1. **Introdução** (30s): Contexto e objetivo
2. **Demo geral** (1min): Navegação pela interface
3. **Bresenham detalhado** (4min): Fluxo completo
4. **Outros algoritmos** (3min): Visão geral
5. **Funcionalidades avançadas** (3min): Fill, transformações, 3D
6. **Aspectos técnicos** (2min): Código e arquitetura
7. **Conclusão** (1min): Resumo e limitações

---

## 📝 Pontos-Chave para Destacar

### **Conceitos Teóricos**
- Algoritmos de rasterização eficientes
- Sistemas de coordenadas discretas
- Parâmetros de decisão para otimização
- Simetria em primitivas circulares

### **Aspectos Práticos**
- Interface responsiva e intuitiva
- Validação robusta de entrada
- Sistema modular e extensível
- Visualização em tempo real

### **Implementação Técnica**
- JavaScript ES6 com módulos
- Canvas 2D para renderização
- Three.js para visualização 3D
- Bootstrap para interface

---

## 🔧 Comandos para Demonstração

### **Sequência de Testes**
1. **Linha simples**: (0,0) → (10,10)
2. **Linha vertical**: (0,0) → (0,15)
3. **Linha horizontal**: (0,0) → (20,0)
4. **Círculo**: centro (0,0), raio 8
5. **Elipse**: centro (0,0), raios 10x5
6. **Bézier**: P0(10,10), P1(-10,0), P2(10,-10)
7. **Polígono**: triângulo com preenchimento
8. **Transformação**: rotação 45° do polígono
9. **Projeção 3D**: cubo com projeção ortogonal

### **Cenários de Erro**
- Coordenadas fora dos limites
- Raio zero ou negativo
- Pontos de controle inválidos
- Área de preenchimento sem bordas
