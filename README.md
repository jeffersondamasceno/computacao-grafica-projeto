# Protótipo Interativo de Computação Gráfica

## 📝 Descrição

Este projeto é um protótipo interativo para visualização de algoritmos clássicos de Computação Gráfica. A aplicação permite que o usuário defina parâmetros através de uma interface e visualize o resultado da rasterização de formas geométricas 2D, transformações e projeções 3D em tempo real.

## 📜 Índice

- [Funcionalidades](https://www.google.com/search?q=%23-funcionalidades)
- [Tecnologias e Ferramentas](https://www.google.com/search?q=%23-tecnologias-e-ferramentas)
- [Como Executar](https://www.google.com/search?q=%23-como-executar)
- [Estrutura do Projeto](https://www.google.com/search?q=%23-estrutura-do-projeto)
- [Guia de Implementação dos Algoritmos](https://www.google.com/search?q=%23-guia-de-implementa%C3%A7%C3%A3o-dos-algoritmos)

## ✨ Funcionalidades

O protótipo é dividido em duas partes principais:

1. **Área de Desenho**: Uma malha quadriculada (canvas) onde os resultados dos algoritmos são plotados.
2. **Interface de Usuário**: Controles como inputs, botões e sliders para definir parâmetros e executar os algoritmos.

### Algoritmos Implementados

- Rasterização de **Linhas** (Bresenham)
- Rasterização de **Círculos** (Ponto Médio)
- Rasterização de **Elipses** (Ponto Médio)
- Desenho de **Polilinhas**
- Curvas de **Bézier** (com rasterização via Bresenham)
- **Preenchimento** de Polígonos (Recursivo e Varredura/Scanline)
- **Recorte** de Linhas (Cohen-Sutherland) e Polígonos (Sutherland-Hodgman)
- **Transformações 2D/3D** (Translação, Rotação, Escala)
- **Projeções 3D** (Ortogonal, Perspectiva, Cavalier, Cabinet)

## 🔧 Tecnologias e Ferramentas

A abordagem recomendada é o desenvolvimento Web, utilizando:

- **HTML, CSS e JavaScript**: Base para a estrutura, estilo e interatividade da aplicação.
- **Canvas API (2D)**: Ideal para implementar os algoritmos de rasterização (linhas, círculos, preenchimento, etc.).
- **Three.js (3D)**: Utilizado para as transformações e projeções 3D, simplificando o pipeline gráfico.
- **dat.GUI** (Opcional): Uma biblioteca leve para criar interfaces de controle (sliders, seletores) de forma rápida.

## 🚀 Como Executar

1. Clone este repositório.
2. Abra o arquivo `index.html` em um navegador web moderno (Chrome, Firefox, Edge).
3. Nenhuma instalação adicional é necessária.

## 📂 Estrutura do Projeto

A estrutura de arquivos sugerida organiza a interface, a lógica principal e os algoritmos de forma modular.

```
/projeto
│
├── index.html       # Estrutura principal com a área de desenho e a interface
├── style.css        # Estilização da página e dos componentes
├── main.js          # Lógica principal, eventos da UI e integração com os algoritmos
│
└── /algorithms      # Módulos separados para cada algoritmo
    ├── bresenham.js
    ├── midpointCircle.js
    ├── midpointEllipse.js
    ├── bezier.js
    ├── fill.js
    ├── clipping.js
    └── ...
```

## 🧠 Guia de Implementação dos Algoritmos

A seguir, um guia detalhado com as regras, lógica e pseudocódigo para cada algoritmo a ser implementado.

<details>
<summary><strong>1. Algoritmo de Bresenham (Linhas)</strong></summary>

O algoritmo de Bresenham rasteriza linhas de forma eficiente, usando apenas aritmética de inteiros. A ideia central é, a cada passo no eixo principal, decidir qual dos dois pixels seguintes está mais próximo da linha ideal.

#### Problema do Octante e Solução

A versão básica do algoritmo funciona apenas no 1º octante (onde $0 \\le m \\le 1$). Para generalizar para todos os octantes, aplicamos um processo de reflexão:

1. Refletir os pontos da linha para o 1º octante.
2. Executar o algoritmo de Bresenham.
3. Refletir os pontos gerados de volta para o octante original.

#### Pseudocódigo (Generalizado para todos os octantes)

```pseudocode
função DesenharLinha(p1, p2):
    // 1. Reflete para o 1º octante e guarda as flags
    flags = reflexao(p1, p2)
    x1, y1 = p1.x, p1.y
    x2, y2 = p2.x, p2.y

    // 2. Algoritmo de Bresenham para o 1º Octante
    pontos = []
    dx = x2 - x1
    dy = y2 - y1
    m = dy / dx
    erro = m - 0.5
    x, y = x1, y1

    Enquanto x <= x2:
        pontos.add( (x, y) )
        Se erro >= 0:
            y = y + 1
            erro = erro - 1
        Fim Se
        x = x + 1
        erro = erro + m
    Fim Enquanto

    // 3. Reflete os pontos de volta para o octante original
    pontos_finais = reflexao_inversa(pontos, flags)
    DesenhaPontos(pontos_finais)
```

</details>

<details>
<summary><strong>2. Algoritmo do Ponto Médio (Círculos)</strong></summary>

Este algoritmo utiliza a simetria de 8 vias do círculo para calcular os pixels de apenas um octante e, em seguida, espelhá-los para os outros sete. A decisão sobre o próximo pixel é baseada na avaliação de uma função implícita do círculo $f(x, y) = x^2 + y^2 - R^2$ em um ponto médio.

#### Regras

- **Simetria**: Calcule os pontos para o octante de 90° a 45° e reflita-os. Para um ponto $(x, y)$, os 8 pontos simétricos são: $(\\pm x, \\pm y)$ e $(\\pm y, \\pm x)$.
- **Parâmetro de Decisão**: A cada passo, avalia-se um parâmetro de decisão $p\_k$ para escolher entre o pixel a Leste $(x\_{k+1}, y\_k)$ ou Sudeste $(x\_{k+1}, y\_{k-1})$.

#### Passo a Passo

1. **Inicialização**:
      - Comece em $(x\_0, y\_0) = (0, R)$.
      - O parâmetro de decisão inicial é $p\_0 = 1 - R$.
2. **Loop para o 1º Octante**:
      - Enquanto $x \\le y$:
        a.  Desenhe os 8 pontos simétricos de $(x, y)$ transladados para o centro $(x\_c, y\_c)$.
        b.  Se $p \< 0$:
          - O próximo ponto é $(x+1, y)$.
          - $p = p + 2x + 3$.
            c.  Senão:
          - O próximo ponto é $(x+1, y-1)$.
          - $p = p + 2(x - y) + 5$.
            d.  $x = x + 1$.

</details>

<details>
<summary><strong>3. Curvas de Bézier</strong></summary>

Curvas de Bézier são definidas por um conjunto de pontos de controle. O **Algoritmo de De Casteljau** é um método recursivo para calcular um ponto $P(t)$ na curva, onde $t \\in [0, 1]$.

#### Passo a Passo (De Casteljau)

Para uma curva com $n+1$ pontos de controle $P\_0, ..., P\_n$ e um valor $t$:

1. A cada nível de recursão, interpole linearmente os pontos do nível anterior:
    $P\_i^r(t) = (1-t)P\_i^{r-1}(t) + t P\_{i+1}^{r-1}(t)$
2. O ponto final na curva é o resultado da última interpolação.

#### Rasterização com Bresenham

1. **Gerar Pontos**: Itere com $t$ de 0 a 1 em pequenos passos (ex: `0.01`). Para cada $t$, use De Casteljau para encontrar o ponto correspondente $P(t)$.
2. **Armazenar Pontos**: Guarde os pontos calculados em uma lista.
3. **Desenhar Polilinha**: Conecte cada par de pontos adjacentes na lista usando o **Algoritmo de Bresenham** para linhas. A sequência de pequenos segmentos de reta irá aproximar a curva suave.

</details>

<details>
<summary><strong>4. Polilinha</strong></summary>

Uma polilinha é uma sequência de segmentos de reta conectados.

#### Passo a Passo

1. Defina uma lista de vértices $P\_0, P\_1, P\_2, ..., P\_n$.
2. Para cada par de vértices consecutivos $(P\_i, P\_{i+1})$ na lista, de $i=0$ até $n-1$:
3. Use o **Algoritmo de Bresenham** para desenhar um segmento de reta entre $P\_i$ e $P\_{i+1}$.

</details>

<details>
<summary><strong>5. Preenchimento de Polígonos</strong></summary>

#### a. Preenchimento Recursivo (Flood Fill)

Preenche uma área conectada a partir de um ponto semente.

- **Regras**: Inicia em um pixel $(x, y)$. Se a cor atual do pixel não for a cor de borda nem a cor de preenchimento, pinta o pixel e chama recursivamente a função para seus 4 vizinhos (cima, baixo, esquerda, direita).
- **Cuidado**: Pode causar estouro de pilha (stack overflow) em áreas muito grandes.

#### b. Preenchimento por Varredura (Scanline)

Mais eficiente e robusto, especialmente para polígonos complexos.

- **Lógica**: Itera através de cada linha de varredura (scanline) que cruza o polígono.

<!-- end list -->

1. Para cada scanline, encontre todas as interseções com as arestas do polígono.
2. Ordene os pontos de interseção por sua coordenada $x$.
3. Preencha os pixels entre pares de interseções (1ª com 2ª, 3ª com 4ª, etc.), aplicando a regra de paridade par-ímpar.

</details>

<details>
<summary><strong>6. Recorte (Clipping)</strong></summary>

#### a. Recorte de Linhas (Cohen-Sutherland)

Eficiente por rejeitar ou aceitar trivialmente segmentos de reta.

1. **Outcodes**: Atribua um código de 4 bits (outcode) a cada extremidade da linha, indicando sua posição em relação à janela de recorte (Cima, Baixo, Direita, Esquerda).
2. **Aceite Trivial**: Se `outcode1 | outcode2 == 0`, a linha está totalmente dentro.
3. **Rejeite Trivial**: Se `outcode1 & outcode2 != 0`, a linha está totalmente fora.
4. **Recorte**: Se não for trivial, calcule a interseção com uma das bordas da janela e repita o processo para o novo segmento menor.

#### b. Recorte de Polígonos (Sutherland-Hodgman)

Recorta um polígono contra cada aresta de uma janela de recorte convexa sequencialmente.

- **Processo**:
    1. Tome a lista de vértices do polígono.
    2. Para cada aresta da janela de recorte (ex: borda esquerda):
        a.  Itere sobre cada aresta do polígono de entrada.
        b.  Gere uma nova lista de vértices de saída baseada em 4 regras (dentro-\>dentro, dentro-\>fora, fora-\>dentro, fora-\>fora).
    3. A lista de saída de uma etapa se torna a entrada para a próxima, até que todas as arestas da janela tenham sido processadas.

</details>

<details>
<summary><strong>7. Transformações Geométricas</strong></summary>

Usando coordenadas homogêneas, transformações 2D e 3D podem ser representadas por multiplicações de matrizes. Um ponto 2D $(x, y)$ se torna $(x, y, 1)$.

#### a. Translação

$$P' = T(T_x, T_y) \cdot P \quad | \quad T = \begin{pmatrix} 1 & 0 & T_x \\ 0 & 1 & T_y \\ 0 & 0 & 1 \end{pmatrix}$$

#### b. Escala (em relação à origem)

$$P' = S(S_x, S_y) \cdot P \quad | \quad S = \begin{pmatrix} S_x & 0 & 0 \\ 0 & S_y & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

#### c. Rotação (em relação à origem)

$$P' = R(\theta) \cdot P \quad | \quad R = \begin{pmatrix} \cos(\theta) & -\sin(\theta) & 0 \\ \sin(\theta) & \cos(\theta) & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

**Observação**: Para escalar ou rotacionar em torno de um ponto arbitrário, primeiro translade o ponto para a origem, aplique a transformação e, em seguida, translade de volta. A ordem de multiplicação das matrizes é importante: $M = T\_{inversa} \\cdot R(\\theta) \\cdot T\_{original}$.

</details>

<details>
<summary><strong>8. Projeções 3D</strong></summary>

Projeções transformam coordenadas 3D em 2D.

#### a. Projeção Paralela Ortográfica

Raios projetores são perpendiculares ao plano de projeção. Preserva tamanhos e ângulos relativos. Para projetar no plano XY (descartando Z):
$$M_{orto} = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

#### b. Projeção Paralela Oblíqua

Raios projetores não são perpendiculares ao plano.

- **Cavalier**: Preserva a profundidade (dimensões em Z).
- **Cabinet**: Reduz a profundidade (geralmente pela metade) para um efeito mais realista.

#### c. Projeção Perspectiva

Simula a visão humana, onde objetos mais distantes parecem menores. O centro de projeção está a uma distância finita. A transformação envolve uma divisão pela coordenada de profundidade (Z). Uma matriz de projeção perspectiva simples com o plano de projeção em $z=d$ é:
$$M_{persp} = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 1/d & 0 \end{pmatrix}$$
Após a multiplicação, o vetor resultante $(x', y', z', w')$ deve ser normalizado dividindo por $w'$ para obter as coordenadas 2D finais.

</details>

<details>
<summary><strong>9. Algoritmo do Ponto Médio (Elipses)</strong></summary>

Uma extensão do algoritmo para círculos, mas considerando os dois raios $(r\_x, r\_y)$. A elipse é dividida em duas regiões no primeiro quadrante, pois a inclinação da curva muda de $\> -1$ para $\< -1$.

- **Região 1**: A partir de $(0, r\_y)$, damos passos em $x$ e decidimos se $y$ deve ser decrementado. Isso continua até que a inclinação da curva seja $-1$.
- **Região 2**: A partir do último ponto da Região 1, damos passos em $y$ e decidimos se $x$ deve ser incrementado, até que $y=0$.

Como no círculo, a simetria de 4 vias é usada para desenhar os pontos nos outros três quadrantes.

</details>
