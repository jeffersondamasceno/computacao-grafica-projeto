# Protótipo Interativo – Guia de Implementação

O protótipo deve ser dividido em duas partes principais:

1. **Área de desenho** – malha quadriculada onde os resultados dos algoritmos serão plotados.  
2. **Interface de usuário** – inputs, botões, sliders e demais controles para definir parâmetros e aplicar algoritmos.

---

## ✏️ Algoritmos a implementar

- Bresenham (linhas)  
- Círculos  
- Curvas de Bézier (usando Bresenham para rasterização)  
- Polilinha  
- Preenchimento (recursivo e varredura)  
- Recorte (linha e polígono)  
- Transformações (rotação, translação, escala)  
- Projeções (ortogonal, perspectiva, cavalier, cabinet)  
- Elipse  

---

## 💡 Dica Final

A melhor abordagem é **Web + JavaScript**, pois:  

- Há menção ao *Three.js*, indicando a expectativa de uso de tecnologias web.  
- A entrega exige interatividade com inputs e interface gráfica (facilmente implementada com HTML + JS).  
- Os requisitos incluem 2D e 3D (o Three.js já resolve nativamente, mas pode-se iniciar com o Canvas 2D).  

---

## 🔧 Ferramentas Recomendadas

1. **HTML + CSS + JavaScript** – base do projeto.  
2. **Canvas API (2D)** – para algoritmos de rasterização (linhas, círculos, elipses, recorte, preenchimento e transformações).  
3. **Three.js (3D)** – para projeções ortogonais, perspectiva, cavalier e cabinet.  
   - Pode-se combinar: Canvas para algoritmos 2D e Three.js apenas para projeções 3D.  
4. **Interface** – elementos HTML (`<input>`, `<select>`, `<button>`) ou bibliotecas como **dat.GUI** para sliders e painéis.  

---

## 📌 Estrutura Sugerida do Projeto

/project

│── index.html → área de desenho (Canvas ou Three.js) + painel lateral com controles

│── style.css → estilização

│── main.js → lógica principal, integração da interface com os algoritmos

│── /algorithms → arquivos JS separados por algoritmo

├── bresenham.js

├── midpointCircle.js

├── bezier.js

├── ...


---

## 🚀 Organização do Trabalho

- Dedicar um período para implementar **um algoritmo por vez** em JavaScript.  
- Testar cada implementação desenhando na malha (Canvas).  
- Adicionar botões e inputs na interface para chamar cada algoritmo.  
- Iniciar com **Canvas 2D** (mais rápido para rasterização).  
- Integrar o **Three.js** apenas na etapa de projeções.  
