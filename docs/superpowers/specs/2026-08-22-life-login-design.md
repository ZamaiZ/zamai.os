# Life Login — Design

## Objetivo

Criar uma experiência de login navegável e validada para o Life. A tela deve apresentar o produto como um sistema pessoal preciso e vivo, sem conectar autenticação, persistir credenciais ou redirecionar nesta etapa.

## Direção visual

O layout divide a experiência entre o formulário à esquerda e um artefato visual à direita. O formulário usa a superfície Mist clara, tipografia e componentes Maia existentes. A cena ocupa um espaço grafite profundo e contemplativo.

O centro da cena é uma figura humana estilizada, neutra, sem rosto, gênero marcado, anatomia muscular ou linguagem fitness. A figura representa identidade. Órbitas, eixos e nós representam um sistema pessoal de alta precisão. Luz, partículas e respiração comunicam um organismo vivo em evolução.

A composição usa Mist para estrutura, Cyan para fluxo e Yellow somente em um pulso raro de insight ou integração. Ela evita HUD, estética cyberpunk, neon excessivo, métricas, números e cards fictícios.

## Arquitetura

- `src/app/login/page.tsx`: Server Component que define os metadados da rota e monta a tela.
- `src/components/auth/login-screen.tsx`: Client Component com o formulário, validação local, Motion e composição responsiva.
- `src/components/three/life-scene-loader.tsx`: Client Component responsável pelo `next/dynamic` com `ssr: false`, detecção de reduced motion e escolha entre Canvas e poster.
- `src/components/three/life-scene.tsx`: cena React Three Fiber com figura procedural, iluminação, órbitas, eixos, nós e partículas.
- `src/components/three/life-scene-poster.tsx`: representação estática equivalente para carregamento, telas pequenas, reduced motion e ausência de WebGL.

A figura será construída proceduralmente em React Three Fiber. `public/models/life-figure.glb` não fará parte desta entrega.

O Canvas fica isolado do formulário e nunca participa da renderização no servidor. Falha ou indisponibilidade do WebGL não impede o uso do formulário.

## Cena 3D

A figura é formada por volumes orgânicos foscos: cabeça, pescoço, tronco, pelve e membros suavizados. A silhueta permanece vertical, serena e abstrata. O material estrutural parte de Mist com baixa reflexão e recebe luz Cyan lateral.

Três órbitas finas e inclinadas cruzam planos distintos ao redor da figura. Poucos nós Cyan percorrem esses caminhos lentamente. Partículas esparsas têm deriva suave e profundidade suficiente para sugerir espaço sem virar um campo estelar. Yellow aparece brevemente no momento de integração.

O loop conceitual segue a sequência:

1. `breathe`
2. `understand`
3. `align`
4. `sharpen`
5. `integrate`
6. `breathe`

Cada fase modula discretamente respiração, luz, órbitas ou nós. Um rótulo tipográfico pequeno apresenta a etapa atual. A animação é lenta, contínua e não interativa.

## Responsividade e movimento reduzido

Em telas desktop, o formulário ocupa aproximadamente 42% da largura e a cena ocupa o restante. Em telas pequenas, o formulário domina a interface e uma versão compacta do poster funciona como atmosfera visual. O Canvas não é carregado no mobile.

Durante o carregamento dinâmico, o poster reserva toda a área da cena e evita mudança de layout. Usuários com `prefers-reduced-motion: reduce` recebem apenas o poster, congelado na fase `integrate`, sem transições não essenciais.

## Formulário

O formulário contém:

- campo de e-mail com rótulo persistente;
- campo de senha com rótulo persistente;
- controle acessível para mostrar ou ocultar a senha;
- ação principal “Entrar”;
- indicações visuais de “Esqueci minha senha” e “Criar conta”, inativas nesta etapa;
- aviso discreto de que a experiência é demonstrativa e nenhuma credencial é enviada.

React Hook Form controla o estado e Zod valida um e-mail bem formado e uma senha obrigatória. Erros aparecem junto ao campo, usam `aria-invalid` e são anunciados por leitor de tela. O envio válido chama apenas `preventDefault`: não usa rede, não persiste dados, não altera rota e não apresenta um fluxo de sucesso.

O formulário entra com uma sequência curta de opacidade e deslocamento usando Motion. Em reduced motion, todos os elementos aparecem diretamente no estado final.

## Falhas e fallback

O poster é o estado inicial e o fallback permanente quando qualquer pré-condição do Canvas não é atendida. O loader verifica largura de viewport, preferência de movimento e suporte a WebGL antes de solicitar o módulo 3D. Um erro de carregamento da cena preserva o poster. O formulário permanece independente desses estados.

## Acessibilidade

- Contraste mínimo de 4.5:1 para texto normal.
- Rótulos visíveis para todos os campos.
- Ordem de tabulação previsível e foco visível.
- Controle de senha com nome acessível que descreve a ação.
- Erros associados aos respectivos campos.
- Arte 3D marcada como decorativa; o significado essencial também aparece em texto.
- Alvos interativos com pelo menos 44 por 44 pixels.
- Nenhuma informação depende exclusivamente de cor ou movimento.

## Testes e verificação

Os testes de componente devem cobrir:

- renderização do conteúdo essencial sem depender do Canvas;
- erros para e-mail inválido e senha ausente;
- alternância entre senha oculta e visível;
- submissão válida sem rede, persistência ou navegação;
- poster usado em reduced motion e viewport pequena;
- nomes, rótulos e estados acessíveis.

A cena 3D será validada por typecheck, build e inspeção visual, pois sua qualidade principal é espacial e temporal. A entrega será verificada com testes, ESLint, TypeScript e build de produção do Next.js.

## Fora do escopo

- Backend ou provedor de autenticação.
- Sessão, cookies e armazenamento de credenciais.
- Recuperação de senha e cadastro funcionais.
- Redirecionamento após envio.
- Modelo GLB, vídeo ou asset humano gerado por IA.
- Interações, métricas, cards ou dados simulados dentro da cena.
