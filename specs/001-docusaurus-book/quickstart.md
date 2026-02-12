# Quickstart: Docusaurus Physical AI Textbook

## Prerequisites

- Node.js 20 LTS installed
- npm 10+ installed
- Git configured

## Setup

```bash
# 1. Initialize Docusaurus project
npx create-docusaurus@latest physical-ai-book classic

# 2. Enter project directory
cd physical-ai-book

# 3. Install Mermaid theme
npm install @docusaurus/theme-mermaid

# 4. Install local search plugin
npm install docusaurus-search-local

# 5. Start development server
npm run start
```

## Verify Setup

1. Open http://localhost:3000 in browser
2. Confirm landing page renders
3. Confirm sidebar navigation works
4. Confirm dark mode toggle works

## Build for Production

```bash
npm run build
```

Verify zero broken links and zero build errors.

## Deploy to GitHub Pages

```bash
# Push to main branch - GitHub Actions handles deployment
git add . && git commit -m "feat: initial book setup" && git push
```

Verify at: `https://<username>.github.io/<repo-name>/`

## Add a New Chapter

1. Create `docs/<module-slug>/<position>-<slug>.mdx`
2. Add frontmatter (sidebar_position, title, description, keywords)
3. Write content following the chapter structure
4. Run `npm run build` to verify no broken links
5. Commit and push

## Integration Test Scenarios

| Scenario | Steps | Expected |
|----------|-------|----------|
| Homepage loads | Visit root URL | Landing page with course overview visible |
| Sidebar navigation | Click any module → chapter | Chapter content renders correctly |
| Code blocks | View any chapter with code | Syntax highlighting, copy button, line numbers |
| Mermaid diagrams | View chapter with ```mermaid block | Diagram renders inline |
| Dark mode | Toggle theme switch | All content readable in dark mode |
| Search | Type keyword in search bar | Relevant chapters appear in results |
| Mobile responsive | Resize to 375px width | Content readable, sidebar becomes hamburger |
| 404 page | Visit /nonexistent-url | Custom 404 with navigation back |
| Internal links | Click any cross-reference | Target chapter loads correctly |
