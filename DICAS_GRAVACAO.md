# Dicas para Gravação do Vídeo - Computação Gráfica

## 🎥 **Preparação Técnica**

### **Configuração da Tela**
- **Resolução**: 1920x1080 (Full HD) ou superior
- **Zoom do navegador**: 100% (não usar zoom do navegador)
- **Tamanho da janela**: Maximizar o navegador
- **Fonte**: Aumentar tamanho da fonte se necessário (Ctrl +)

### **Configuração do Sistema**
- **Fechar aplicações**: Discord, WhatsApp, notificações
- **Modo avião**: Para evitar interrupções
- **Bateria**: Conectar carregador se laptop
- **Internet**: Estável para carregar Three.js

### **Ferramentas de Gravação**
- **OBS Studio**: Gratuito, profissional
- **Loom**: Online, fácil de usar
- **Bandicam**: Pago, boa qualidade
- **QuickTime**: Mac nativo

## 🎯 **Estrutura do Vídeo (15-20 minutos)**

### **1. Abertura (30 segundos)**
```
"Olá! Meu nome é [Seu Nome] e hoje vou apresentar meu projeto 
de Computação Gráfica. Este é um sistema interativo que implementa 
algoritmos fundamentais de rasterização usando JavaScript e HTML5 Canvas."
```

### **2. Visão Geral (1 minuto)**
- **Mostrar a interface completa**
- **Navegar pelos painéis laterais**
- **Explicar as funcionalidades principais**
- **Destacar a malha de coordenadas**

### **3. Arquitetura (2 minutos)**
- **Abrir o código no editor**
- **Mostrar a estrutura de arquivos**
- **Explicar a classe GraphicsCanvas**
- **Mostrar os imports dos algoritmos**

### **4. Bresenham Detalhado (5 minutos)**

#### **4.1 Preparação (30 segundos)**
```
"Agora vou demonstrar o algoritmo de Bresenham para desenhar linhas. 
Este é um dos algoritmos mais importantes em computação gráfica."
```

#### **4.2 Modo Input (2 minutos)**
- **Abrir seção Bresenham**
- **Preencher campos**: x1=0, y1=0, x2=10, y2=10
- **Clicar "Desenhar via Input"**
- **Explicar o que acontece**:
  - Validação de coordenadas
  - Salvamento do desenho
  - Chamada do algoritmo
  - Renderização

#### **4.3 Explicação do Algoritmo (2 minutos)**
- **Abrir arquivo bresenham.js**
- **Explicar os parâmetros**: dx, dy, sx, sy, err
- **Mostrar o loop principal**
- **Explicar a decisão de pixel**

#### **4.4 Modo Interativo (30 segundos)**
- **Clicar "Desenhar Interativo"**
- **Clicar dois pontos no canvas**
- **Mostrar o preview em tempo real**

### **5. Outros Algoritmos (4 minutos)**

#### **5.1 Círculos (1 minuto)**
- **Abrir seção Círculos**
- **Desenhar círculo**: centro (0,0), raio 8
- **Explicar simetria de 8 pontos**

#### **5.2 Elipses (1 minuto)**
- **Abrir seção Elipses**
- **Desenhar elipse**: centro (0,0), raios 10x5
- **Explicar duas regiões**

#### **5.3 Bézier (1 minuto)**
- **Abrir seção Bézier**
- **Usar pontos padrão**
- **Explicar pontos de controle**

#### **5.4 Preenchimento (1 minuto)**
- **Desenhar polígono interativo**
- **Preencher com flood fill**
- **Explicar diferença entre algoritmos**

### **6. Transformações (2 minutos)**
- **Abrir seção Transformações**
- **Aplicar translação**: dx=5, dy=5
- **Aplicar rotação**: 45°
- **Aplicar escala**: 2x

### **7. Projeções 3D (3 minutos)**
- **Abrir modal de projeção**
- **Mostrar visualização 3D**
- **Aplicar projeção ortogonal**
- **Aplicar projeção perspectiva**

### **8. Aspectos Técnicos (2 minutos)**
- **Mostrar sistema de coordenadas**
- **Demonstrar zoom e scroll**
- **Explicar gerenciamento de estado**

### **9. Conclusão (1 minuto)**
- **Resumir algoritmos implementados**
- **Mencionar limitações**
- **Falar sobre melhorias futuras**

## 🎬 **Dicas de Apresentação**

### **Fala**
- **Ritmo**: Pausado e claro
- **Tom**: Confiante mas não arrogante
- **Pausas**: Dar tempo para absorver
- **Repetição**: Repetir pontos importantes

### **Navegação**
- **Cursor**: Usar para destacar elementos
- **Zoom**: Aproximar quando necessário
- **Scroll**: Navegar suavemente
- **Cliques**: Pausar após cada clique

### **Explicação do Código**
- **Selecionar**: Destacar linhas importantes
- **Comentar**: Explicar cada parte
- **Pausar**: Dar tempo para ler
- **Voltar**: Retornar à interface quando necessário

## 📝 **Script Detalhado**

### **Introdução**
```
"Este projeto implementa algoritmos fundamentais de computação gráfica 
em uma aplicação web interativa. A interface permite desenhar primitivas 
geométricas usando algoritmos clássicos como Bresenham para linhas, 
Midpoint para círculos e elipses, e curvas de Bézier."
```

### **Arquitetura**
```
"O sistema é modular, com cada algoritmo em seu próprio arquivo. 
A classe GraphicsCanvas gerencia o estado e a renderização, enquanto 
os algoritmos são importados como módulos ES6. Isso facilita a 
manutenção e extensão do código."
```

### **Bresenham**
```
"O algoritmo de Bresenham é eficiente porque usa apenas operações 
inteiras. Ele calcula qual pixel desenhar baseado em um parâmetro 
de decisão que considera a distância da linha ideal."
```

### **Círculos**
```
"O algoritmo do ponto médio para círculos aproveita a simetria. 
Calculamos apenas um octante e espelhamos os pontos para os outros 
sete, reduzindo drasticamente os cálculos necessários."
```

### **Transformações**
```
"As transformações usam matrizes para aplicar translação, rotação 
e escala. O sistema permite transformar o último desenho criado, 
demonstrando como essas operações afetam a geometria."
```

### **Projeções 3D**
```
"O sistema inclui visualização 3D usando Three.js e projeções 
para o plano 2D. Isso demonstra como objetos tridimensionais 
são representados em telas bidimensionais."
```

## ⚠️ **Problemas Comuns e Soluções**

### **Performance Lenta**
- **Solução**: Fechar outras abas do navegador
- **Prevenção**: Testar antes de gravar

### **Erro de Coordenadas**
- **Solução**: Verificar limites da malha
- **Prevenção**: Usar valores dentro dos limites

### **Algoritmo Não Funciona**
- **Solução**: Verificar se há desenho anterior
- **Prevenção**: Limpar canvas antes de testar

### **Modal 3D Não Abre**
- **Solução**: Verificar conexão com internet
- **Prevenção**: Testar Three.js antes de gravar

## 🎯 **Checklist Pré-Gravação**

### **Técnico**
- [ ] Navegador atualizado
- [ ] Internet estável
- [ ] Aplicações desnecessárias fechadas
- [ ] Resolução de tela adequada
- [ ] Ferramenta de gravação configurada

### **Conteúdo**
- [ ] Todos os algoritmos testados
- [ ] Exemplos preparados
- [ ] Código aberto e organizado
- [ ] Script revisado
- [ ] Tempo estimado calculado

### **Apresentação**
- [ ] Fala clara e pausada
- [ ] Cursor visível
- [ ] Navegação suave
- [ ] Explicações preparadas
- [ ] Conclusão definida

## 📊 **Métricas de Sucesso**

### **Tempo**
- **Total**: 15-20 minutos
- **Bresenham**: 5 minutos
- **Outros algoritmos**: 4 minutos
- **Transformações**: 2 minutos
- **3D**: 3 minutos
- **Técnico**: 2 minutos
- **Conclusão**: 1 minuto

### **Qualidade**
- **Clareza**: Explicações compreensíveis
- **Completude**: Todos os algoritmos demonstrados
- **Técnico**: Código mostrado e explicado
- **Interativo**: Modos input e interativo
- **Visual**: Interface bem apresentada

## 🏆 **Dicas Finais**

1. **Pratique antes**: Faça uma gravação de teste
2. **Seja natural**: Não leia o script, use como guia
3. **Mantenha o foco**: Evite distrações
4. **Seja paciente**: Dê tempo para o sistema responder
5. **Tenha backup**: Prepare exemplos alternativos
6. **Seja honesto**: Mencione limitações quando relevante
7. **Termine forte**: Conclusão clara e confiante

## 📝 **Notas Adicionais**

- **Pausas**: Use para transições entre seções
- **Transições**: "Agora vamos ver...", "Próximo algoritmo..."
- **Destaques**: "Note que...", "Observe como..."
- **Conclusões**: "Como vimos...", "Em resumo..."
- **Engajamento**: "Vamos testar...", "Agora vou mostrar..."
