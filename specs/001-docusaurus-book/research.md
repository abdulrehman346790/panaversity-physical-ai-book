# Research: Docusaurus Physical AI Textbook

## Phase 0 Research Findings

### Decision 1: Docusaurus Version
- **Decision**: Docusaurus 3.9.x (latest stable)
- **Rationale**: Latest stable release with MDX v3, built-in Mermaid support, dark mode, and GitHub Pages deployment support
- **Alternatives considered**: Docusaurus 2.x (outdated, MDX v1), Next.js + MDX (more complex setup, no built-in sidebar), MkDocs (Python-based, less React flexibility)

### Decision 2: MDX Version
- **Decision**: MDX v3 (bundled with Docusaurus 3.x)
- **Rationale**: Docusaurus 3.x requires MDX v3. Stricter JSX enforcement ensures fewer runtime errors. Supports React components inline.
- **Alternatives considered**: Plain Markdown (no React components possible), MDX v1 (only available in Docusaurus 2.x)

### Decision 3: Diagram Rendering
- **Decision**: Mermaid via `@docusaurus/theme-mermaid` (official plugin)
- **Rationale**: Constitution Principle VIII mandates Mermaid for inline diagrams. No external image dependencies. Supports dark/light mode themes. Bundled with Docusaurus.
- **Alternatives considered**: PlantUML (requires server), Draw.io (external files), ASCII art (limited expressiveness)

### Decision 4: Search Functionality
- **Decision**: `docusaurus-search-local` plugin (by cmfcmf)
- **Rationale**: No third-party service dependency (Algolia requires approval process). Works fully offline. Suitable for hackathon timeline. Builds search index at build time.
- **Alternatives considered**: Algolia DocSearch (requires application/approval, may delay), Lunr.js manual integration (more work)

### Decision 5: Sidebar Configuration
- **Decision**: Auto-generated sidebar from file structure with `_category_.json` and frontmatter `sidebar_position`
- **Rationale**: Matches the modular chapter structure. Minimal configuration overhead. Adding a chapter is just adding a file.
- **Alternatives considered**: Manual sidebars.js configuration (brittle, must update for every new chapter)

### Decision 6: Deployment Strategy
- **Decision**: GitHub Actions → GitHub Pages using `actions/deploy-pages@v4`
- **Rationale**: Hackathon requirement specifies GitHub Pages. GitHub Actions is the recommended approach for Docusaurus. Zero cost.
- **Alternatives considered**: `docusaurus deploy` CLI command (requires GH_TOKEN), Vercel (allowed but GH Pages is primary requirement), Netlify (not required)

### Decision 7: Custom Components Registration
- **Decision**: Global MDX component registration via `src/theme/MDXComponents.js`
- **Rationale**: PersonalizeButton, TranslateButton, and ChatWidget need to be available in every chapter without per-file imports. Global registration is cleaner.
- **Alternatives considered**: Per-file imports (repetitive, error-prone), Docusaurus plugin (over-engineered for this use case)

### Decision 8: Package Manager
- **Decision**: npm (default for Docusaurus)
- **Rationale**: Simplest setup, widely understood. Lock file ensures reproducible builds.
- **Alternatives considered**: yarn (adds complexity), pnpm (Docusaurus docs use npm primarily)

### Decision 9: Node.js Version
- **Decision**: Node.js 20 LTS
- **Rationale**: Current LTS version. Required by Docusaurus 3.x (minimum Node 18). GitHub Actions supports it natively.
- **Alternatives considered**: Node 18 (EOL approaching), Node 22 (not yet widely adopted in CI)

### Decision 10: Code Block Features
- **Decision**: Use built-in Prism syntax highlighting with copy button (default), line numbers via `showLineNumbers`, file titles via `title="filename.py"`, line highlighting via `{1,3-5}` or magic comments
- **Rationale**: All built-in to Docusaurus - zero configuration needed. Constitution Principle VIII mandates these features.
- **Alternatives considered**: Custom code component (unnecessary, built-in is sufficient)
