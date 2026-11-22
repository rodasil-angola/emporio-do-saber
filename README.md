# Empório do Saber — Website institucional (Rodasil)

Site estático, multipágina, sem backend. Pronto para pré-visualizar e para migrar para WordPress (blocos "HTML Personalizado" / Elementor HTML).

## Comandos

```
node build.mjs     # gera dist/ a partir de src/
node serve.mjs     # pré-visualização em http://localhost:5173
```

`dist/` é o site final (pode ir tal como está para qualquer alojamento estático).
Publicado em GitHub Pages: https://rodasil-angola.github.io/emporio-do-saber/ — cada push para `main` corre `node build.mjs` e publica `dist/` (`.github/workflows/pages.yml`).
Quando houver domínio próprio, trocar `SITE_URL` em `build.mjs` (usado no canonical, Open Graph, sitemap e Schema.org).

## Estrutura

```
src/
  assets/css/tokens.css   cores, fontes, espaçamentos (colar também no CSS Adicional do WordPress)
  assets/css/site.css     estilos de todos os componentes (prefixo rd-)
  assets/js/site.js       header, menu mobile, animações, FAQ, galeria/lightbox, formulário
  assets/img/             fotografias reais da escola + logótipo/favicons
  partials/               head (SEO, Schema.org), header + menu mobile, footer + WhatsApp flutuante
  sections/               secções reutilizadas em várias páginas (níveis, atividades, natação,
                          campanha, FAQ, CTA final)
  pages/                  as 9 páginas (o comentário JSON no topo define slug, título e descrição)
  icons.mjs               ícones SVG ({{icon:nome}})
```

Páginas: `/`, `/sobre/`, `/ensino/`, `/atividades/`, `/matriculas/`, `/precario/`, `/galeria/`, `/contactos/`, `/pre-inscricao/`.

## Componentes (classe CSS → componente pedido)

Header `.rd-header` · MobileMenu `.rd-mobile-menu` · Hero `.rd-hero` · PromoBanner `.rd-promo-banner` ·
SectionHeader `.rd-section-header` · EducationLevelCard `.rd-level-card` · ActivityCard `.rd-activity-card` ·
ExtraActivityCard `.rd-extra` · PriceTable `.rd-price-table` · PriceCard `.rd-price-card` · FAQAccordion `.rd-faq` ·
PreRegistrationForm `#rd-pre-inscricao` · GalleryGrid `.rd-gallery` · ContactCard `.rd-contact-card` ·
OpeningHours `.rd-hours` · WhatsAppButton `.rd-wa-float` · Footer `.rd-footer`

## Migração para WordPress

1. Colar `tokens.css` + `site.css` em Aparência → Personalizar → CSS Adicional (ou num plugin de snippets).
2. Carregar `site.js` uma vez no rodapé (snippet/WPCode). Os links `data-wa` passam a abrir o WhatsApp automaticamente.
3. Para cada página, colar cada `<section>` do HTML gerado em `dist/<página>/index.html` num bloco HTML Personalizado, pela ordem.
4. Trocar os caminhos `../assets/img/...` pelos URLs da Biblioteca de Multimédia.
5. Header e footer: usar o tema/Elementor Theme Builder, ou colar `partials/header.html` e `footer.html` num bloco global.
6. Formulário: substituir por Fluent Forms / WPForms mantendo os mesmos `name` dos campos
   (`nome_aluno`, `data_nascimento`, `nome_encarregado`, `telefone`, `whatsapp`, `nivel`, `tipo_aluno`,
   `tem_codigo`, `codigo_promocional`, `mensagem`). Nesta fase não envia nada para servidor: no fim abre o WhatsApp
   com os dados preenchidos para o encarregado enviar.

## Pendentes do cliente

- Fotografia das aulas de natação (hoje há uma ilustração em `src/sections/natacao.html`, com instruções no comentário).
- Fotografias de Informática, Xadrez e Expressão Musical (os cards usam ícones).
- Localização para o Google Maps (o espaço está em `contactos.html`, `#mapa`).
- Domínio final (`SITE_URL`).
