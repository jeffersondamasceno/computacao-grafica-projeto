# 🎨 Computação Gráfica - Projeto Interativo

## 📋 Sobre o Projeto

Este é um projeto de Computação Gráfica que implementa algoritmos fundamentais de rasterização em uma aplicação web interativa. O sistema permite desenhar primitivas geométricas usando algoritmos clássicos como Bresenham, Midpoint Circle, curvas de Bézier e muito mais.

## 🚀 Como Executar

### Pré-requisitos
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **VS Code** (recomendado)
- **Extensão Live Server** para VS Code

### Passo a Passo

1. **Clone ou baixe o projeto**
   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd computacao-grafica-projeto
   ```

2. **Abra o projeto no VS Code**
   - Abra a pasta do projeto no Visual Studio Code

3. **Instale a extensão Live Server**
   - Vá em Extensions (Ctrl+Shift+X)
   - Procure por "Live Server"
   - Instale a extensão do Ritwick Dey

4. **Execute o projeto**
   - Clique com o botão direito no arquivo `index.html`
   - Selecione "Open with Live Server"
   - Ou use o atalho: Alt+L, Alt+O

5. **Acesse no navegador**
   - O projeto abrirá automaticamente no navegador
   - URL padrão: `http://127.0.0.1:5500`

## 🎯 Funcionalidades

### Algoritmos Implementados
- **Bresenham** - Desenho de linhas
- **Midpoint Circle** - Desenho de círculos
- **Midpoint Ellipse** - Desenho de elipses
- **Curvas de Bézier** - Curvas suaves
- **Polilinhas** - Desenho de polígonos
- **Preenchimento** - Flood fill e scanline
- **Transformações 2D** - Translação, rotação, escala
- **Projeções 3D** - Visualização tridimensional

### Modos de Uso
- **Input**: Campos de texto para coordenadas precisas
- **Interativo**: Clique no canvas para desenhar
- **Preview**: Visualização em tempo real

## 🎮 Como Usar

### Desenhar uma Linha (Bresenham)
1. Abra a seção "Bresenham (Linhas)"
2. Preencha os campos x1, y1, x2, y2
3. Clique "Desenhar via Input"
4. Ou use "Desenhar Interativo" para clicar no canvas

### Desenhar um Círculo
1. Abra a seção "Círculos"
2. Defina centro (x, y) e raio
3. Clique "Desenhar via Input"
4. Ou use "Desenhar Interativo"

### Desenhar uma Elipse
1. Abra a seção "Elipse"
2. Defina centro (x, y) e semi-eixos (a, b)
3. Clique "Desenhar via Input"
4. Ou use "Desenhar Interativo"

### Desenhar Curva de Bézier
1. Abra a seção "Curvas de Bézier"
2. Defina os 3 pontos de controle (P0, P1, P2)
3. Clique "Desenhar Curva"

### Desenhar Polígono
1. Abra a seção "Polilinha"
2. Use "Desenhar Interativo"
3. Clique nos pontos desejados
4. Duplo clique para finalizar

### Preencher Área
1. Desenhe um polígono fechado primeiro
2. Abra a seção "Preenchimento"
3. Escolha o algoritmo (Recursivo ou Scanline)
4. Clique "Preencher Interativo" e clique na área

### Transformações 2D
1. Desenhe um objeto primeiro
2. Abra a seção "Transformações 2D"
3. Escolha o tipo (Translação, Rotação, Escala)
4. Preencha os parâmetros
5. Clique "Aplicar ao Último Desenho"

### Projeções 3D
1. Abra a seção "Projeções 3D"
2. Clique "Abrir Editor de Projeção"
3. Defina vértices e arestas do objeto 3D
4. Escolha o tipo de projeção
5. Clique "Aplicar Projeção no Canvas 2D"

## ⚙️ Configurações

### Controles da Interface
- **Zoom**: Ctrl+Scroll ou botões de zoom
- **Grid**: Botão "Malha" para mostrar/ocultar grade
- **Cores**: Seletor de cor no painel lateral
- **Limpar**: Botão "Limpar" para resetar o canvas

### Tamanho da Grade
- Use os controles deslizantes para ajustar largura e altura
- Clique "Aplicar Tamanho" para confirmar
- Tamanho padrão: 40x30 unidades

## 🔧 Estrutura do Projeto

```
computacao-grafica-projeto/
├── index.html              # Interface principal
├── main.js                 # Lógica principal da aplicação
├── style.css              # Estilos da interface
├── algorithms/            # Algoritmos implementados
│   ├── bresenham.js       # Algoritmo de Bresenham
│   ├── midpointCircle.js  # Algoritmo do Ponto Médio para círculos
│   ├── ellipse.js         # Algoritmo do Ponto Médio para elipses
│   ├── bezier.js          # Curvas de Bézier
│   ├── polyline.js        # Polilinhas e polígonos
│   ├── fill.js            # Algoritmos de preenchimento
│   ├── transformations.js # Transformações 2D
│   └── projections.js     # Projeções 3D
└── README_EXECUTAR.md     # Este arquivo
```

## 🐛 Solução de Problemas

### O projeto não abre
- Verifique se o Live Server está rodando
- Tente recarregar a página (F5)
- Verifique se não há erros no console do navegador

### Algoritmos não funcionam
- Verifique se as coordenadas estão dentro dos limites da grade
- Use valores inteiros para coordenadas
- Limpe o canvas e tente novamente

### Performance lenta
- Feche outras abas do navegador
- Reduza o tamanho da grade
- Evite desenhar muitos objetos ao mesmo tempo

## 📚 Tecnologias Utilizadas

- **HTML5** - Estrutura da interface
- **CSS3** - Estilização e layout responsivo
- **JavaScript ES6** - Lógica da aplicação
- **HTML5 Canvas** - Renderização 2D
- **Three.js** - Visualização 3D
- **Bootstrap** - Framework CSS

## 👨‍💻 Desenvolvido por

[Seu Nome] - Projeto para disciplina de Computação Gráfica

## 📄 Licença

Este projeto é para fins educacionais.

---

**Dica**: Para uma melhor experiência, use o navegador em tela cheia e ajuste o zoom conforme necessário!
