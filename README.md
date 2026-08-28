<p align="center">
  <img src="https://raw.githubusercontent.com/KT-TWEAKS/kt-wirzade-site/main/public/img/logo-new.png" alt="KT WIRZADE" width="120">
</p>

<h1 align="center">KT WIRZADE — Site Oficial 🌐</h1>

<p align="center">
  <b>Enhance. Build. Optimize.</b> — Um projeto <a href="https://github.com/KT-TWEAKS">KT TWEAKS</a>
</p>

<p align="center">
  Site público do <b>KT WIRZADE</b>: wizard de otimização do Windows por playbooks <code>.apbx</code>,<br>com rollback real, IPC seguro e ferramentas para criadores.
</p>

<p align="center">
  <a href="https://kt-wirzade-site.vercel.app"><img src="https://img.shields.io/badge/site-kt--wirzade--site.vercel.app-8b5cf6" alt="Site"></a>
  <img src="https://img.shields.io/badge/Astro-5-FF5D01?logo=astro&logoColor=white" alt="Astro 5">
  <a href="LICENSE"><img src="https://img.shields.io/badge/licen%C3%A7a-MIT-yellow" alt="Licença MIT"></a>
</p>

<p align="center">
  <a href="https://kt-wirzade-site.vercel.app">Visitar o site</a> ·
  <a href="https://kt-wirzade-site.vercel.app/docs">Documentação</a> ·
  <a href="https://github.com/KT-TWEAKS/KT-WIRZADE">App (KT WIRZADE)</a> ·
  <a href="https://github.com/KT-TWEAKS/KT-TWEAKS-APBX">Catálogo de playbooks</a>
</p>

---

Construído com [Astro 5](https://astro.build) (saída estática).

**Produção:** https://kt-wirzade-site.vercel.app

## Rotas

| Rota | Página |
|---|---|
| `/` | Landing — hero, toolset, comparativo KT WIRZADE × AME Wizard |
| `/docs` | Documentação pública (índice) |
| `/docs/faq` | Perguntas frequentes |
| `/docs/changelog` | Changelog do app |
| `/docs/rollback` | Como funciona o rollback |
| `/docs/seguranca` | Segurança do motor |
| `/docs/modo-iso` | Modo ISO |
| `/docs/instalar-playbooks` | Como instalar playbooks |
| `/docs/apbx-developer` | APBX Developer |

## Estrutura

```
├── src/
│   ├── layouts/        # BaseLayout (home) · DocsLayout (documentação)
│   ├── components/     # Nav · Footer · Loader
│   ├── pages/          # Rotas: index, 404, docs/*
│   │   └── docs/       # 8 páginas de documentação pública
│   └── styles/         # home.css · docs.css
├── public/             # Servido como estático: img/ · css/ · js/ · robots.txt · sitemap.xml
├── astro.config.mjs    # output: static · site: https://kt-wirzade-site.vercel.app
├── vercel.json         # Headers de segurança e cleanUrls
└── package.json
```

## Desenvolvimento

```bash
npm install       # dependências
npm run dev       # dev server em http://localhost:4321
npm run build     # build estático em dist/
npm run preview   # serve o build localmente
```

## Destaques do site

- Fundo interativo em **Three.js** (partículas roxo/ciano que seguem o mouse)
- Loader boot-style, cursor customizado, scanlines + noise
- Seção **toolset** com destaque rotativo de recursos
- Comparativo KT WIRZADE × AME Wizard
- FAQ, documentação pública e catálogo de playbooks

## Deploy

A Vercel detecta o projeto Astro automaticamente e faz **deploy a cada push em `main`** (build: `astro build`, output: `dist/`).

Deploy manual (opcional):

```bash
vercel --prod
```

## Licença

[MIT](LICENSE) © KT TWEAKS
