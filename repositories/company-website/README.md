# AI-Whisperers Company Website

Official website for AI-Whisperers - Advanced AI consultancy and development services.

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom components
- **Animations**: Framer Motion
- **AI Integration**: AI SDK (OpenAI + Anthropic)
- **Content**: YAML-based content management
- **Icons**: Lucide React

## 🌐 Live Website

- **Production**: https://ai-whisperers.com
- **Staging**: https://company-website-staging.vercel.app

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage
│   ├── sobre-nosotros/    # About page (Spanish)
│   ├── servicios/         # Services page
│   ├── contacto/          # Contact page
│   ├── blog/              # Blog section
│   └── api/               # API routes
├── components/
│   ├── pages/             # Page components
│   ├── sections/          # Reusable sections
│   ├── interactive/       # Interactive components
│   └── ui/                # Base UI components
├── lib/
│   ├── content/           # Content management
│   ├── i18n/              # Internationalization
│   └── themes/            # Theme management
└── types/                 # TypeScript definitions

content/                   # YAML content files
├── pages/                 # Page content
├── shared/                # Shared content
└── team/                  # Team member profiles
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Start development server**:
```bash
npm run dev
# With Turbopack (faster):
npm run dev

# Without Turbopack:
npm run dev:stable
```

3. **Open in browser**: http://localhost:3000

### Available Scripts

```bash
# Development
npm run dev              # Start with Turbopack
npm run dev:stable       # Start without Turbopack
npm run build           # Build for production
npm start              # Start production server

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run type-check     # TypeScript type checking
npm test              # Run tests (placeholder)

# Analysis
npm run analyze        # Bundle analysis
```

## ✨ Features

### Core Features
- **Multilingual Support** - Spanish/English content
- **AI Integration** - OpenAI and Anthropic AI services
- **Dynamic Content** - YAML-based content management
- **Responsive Design** - Mobile-first approach
- **Modern UI/UX** - Clean, professional design
- **SEO Optimized** - Meta tags, structured data, sitemap
- **Performance Optimized** - Next.js optimization features

### Advanced Features
- **Interactive Components** - Newsletter signup, pricing calculator
- **Theme System** - Customizable color themes
- **Animation System** - Framer Motion animations
- **Content API** - Dynamic content loading
- **Structured Data** - Rich snippets for SEO

## 📝 Content Management

Content is managed through YAML files in the `content/` directory:

### Page Content
```yaml
# content/pages/homepage.yml
meta:
  title: "AI-Whisperers - Advanced AI Solutions"
  description: "Expert AI consultancy and development services"

hero:
  title: "Transform Your Business with AI"
  subtitle: "Expert AI consultancy and development services"
  cta:
    text: "Get Started"
    href: "/contacto"
```

### Adding New Content
1. Create/edit YAML files in `content/`
2. Use the content API: `useContent('homepage')`
3. Content updates automatically in development

## 🎨 Styling & Themes

### Tailwind CSS v4
- Modern CSS-first approach
- Custom color system
- Responsive design utilities
- Dark/light mode support

### Theme Customization
```typescript
// lib/themes/colorThemes.ts
export const themes = {
  corporate: { /* colors */ },
  creative: { /* colors */ },
  minimal: { /* colors */ }
}
```

## 🔧 Configuration

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_SITE_URL=https://ai-whisperers.com
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
```

### Next.js Configuration
- TypeScript optimizations
- Bundle analysis ready
- Vercel deployment optimized

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Automatic deployment on push to main branch
# Manual deployment:
vercel --prod
```

### Build Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node.js Version**: 18+

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🧪 Testing

### Current Status
- Component testing: Coming soon
- E2E testing: Coming soon
- Performance testing: Lighthouse CI ready

### Adding Tests
```bash
# Will add:
# - Jest + React Testing Library
# - Playwright for E2E testing
# - Storybook for component development
```

## 📊 Analytics & SEO

### SEO Features
- **Meta Tags**: Dynamic per page
- **Structured Data**: JSON-LD markup
- **Sitemap**: Auto-generated
- **Robots.txt**: Configured
- **OpenGraph**: Social media optimization

### Analytics Integration
- Google Analytics 4 ready
- Custom event tracking
- Performance monitoring

## 🔒 Security

### Security Features
- **Content Security Policy**: Configured
- **HTTPS**: Enforced
- **Environment Variables**: Properly secured
- **API Routes**: Input validation

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test locally
3. Run quality checks: `npm run lint && npm run type-check`
4. Commit with conventional commits
5. Create pull request

### Code Style
- ESLint configuration included
- TypeScript strict mode
- Prettier formatting (coming soon)

## 📞 Support

- **Email**: business@ai-whisperers.com
- **Issues**: [GitHub Issues](https://github.com/Ai-Whisperers/company-website/issues)
- **Discussions**: [GitHub Discussions](https://github.com/orgs/Ai-Whisperers/discussions)

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ by the AI-Whisperers team using Next.js 15 and modern web technologies.**