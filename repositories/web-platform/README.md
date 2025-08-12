# Web Platform

Frontend applications and user interfaces for AI-Whisperers.

## Tech Stack

- **Framework**: React 18 / Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS / Styled Components
- **State Management**: Redux Toolkit / Zustand
- **Data Fetching**: React Query / SWR
- **Testing**: Jest, React Testing Library, Cypress
- **Build Tool**: Vite / Webpack

## Project Structure

```
web-platform/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components/routes
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API service layer
│   ├── styles/        # Global styles and themes
│   └── utils/         # Utility functions
├── public/            # Static assets
└── tests/             # Test suites
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ai-Whisperers/web-platform.git
cd web-platform
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm start            # Start production server

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run e2e          # Run end-to-end tests
npm run e2e:headless # Run e2e tests headless

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run typecheck    # TypeScript type checking

# Analysis
npm run analyze      # Analyze bundle size
npm run lighthouse   # Run Lighthouse audit
```

## Component Structure

### Example Component

```typescript
// src/components/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  children
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

## State Management

### Store Structure

```typescript
store/
├── slices/
│   ├── authSlice.ts
│   ├── userSlice.ts
│   └── uiSlice.ts
├── hooks.ts
└── index.ts
```

## API Integration

### Service Layer

```typescript
// src/services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  auth: {
    login: (credentials) => post('/auth/login', credentials),
    logout: () => post('/auth/logout'),
    refresh: () => post('/auth/refresh')
  },
  users: {
    getAll: () => get('/users'),
    getById: (id) => get(`/users/${id}`),
    update: (id, data) => put(`/users/${id}`, data),
    delete: (id) => del(`/users/${id}`)
  }
};
```

## Styling Guide

### Theme Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
        accent: {...}
      },
      typography: {...},
      spacing: {...}
    }
  }
};
```

## Performance Optimization

- Code splitting with dynamic imports
- Image optimization with next/image
- Lazy loading components
- Memoization with React.memo and useMemo
- Virtual scrolling for large lists
- Service Worker for offline support

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing with @testing-library/react-hooks
- Utility function testing with Jest

### Integration Tests
- API integration testing
- Route testing
- State management testing

### E2E Tests
- User flow testing with Cypress
- Cross-browser testing
- Mobile responsiveness testing

## Deployment

### Build for Production

```bash
npm run build
```

### Docker Deployment

```bash
docker build -t ai-whisperers/web-platform .
docker run -p 3000:3000 ai-whisperers/web-platform
```

### Vercel Deployment

```bash
vercel --prod
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:8000 |
| `NEXT_PUBLIC_APP_URL` | Application URL | http://localhost:3000 |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | - |

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

Please read our [Contributing Guide](https://github.com/Ai-Whisperers/documentation/blob/main/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is proprietary and confidential.