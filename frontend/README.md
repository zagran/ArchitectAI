# ArchitectAI Frontend

AI-Powered System Architecture Generator Frontend - built with Next.js and Amazon Nova integration.

## Features

- **Intuitive Requirements Input**: Natural language processing with document and image upload support
- **Real-time Architecture Generation**: Powered by Amazon Nova models 
- **Interactive Architecture Visualization**: Professional AWS diagrams and component relationships
- **Comprehensive Cost Analysis**: Real-time pricing with optimization suggestions
- **Implementation Roadmaps**: Step-by-step deployment guides with Infrastructure as Code
- **Template Library**: Pre-built architecture patterns for common use cases
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Tech Stack

- **Next.js 14**: React framework with App Router and TypeScript
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form + Zod**: Form handling with validation
- **Recharts**: Beautiful charts for cost analysis and metrics
- **Headless UI**: Accessible UI components
- **Axios + SWR**: API client with caching and real-time updates

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Running ArchitectAI backend (see backend README)

### Installation

1. **Install dependencies**:
   ```bash
   cd architectai-frontend
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3000

### Build for production

```bash
npm run build
npm start
```

## Environment Variables

Create `.env.local` with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=ArchitectAI
NEXT_PUBLIC_VERSION=1.0.0

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## Project Structure

```
src/
├── components/           # React components
│   ├── Layout/          # Layout components
│   ├── ui/              # Reusable UI components
│   ├── RequirementsInput/ # Requirements input form
│   ├── ArchitectureViewer/ # Architecture visualization
│   └── CostAnalysis/    # Cost analysis components
├── pages/               # Next.js pages
│   ├── projects/        # Project management pages
│   ├── architectures/   # Architecture pages
│   └── templates/       # Template library
├── lib/                 # Utilities and API client
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── styles/              # Global styles and CSS
```

## Key Components

### RequirementsInput
- Natural language requirements processing
- File upload for documents and diagrams  
- Constraints and preferences configuration
- Form validation with real-time feedback

### ArchitectureViewer
- Interactive architecture diagram
- Component details and relationships
- Cost breakdown visualization
- Implementation roadmap display

### CostAnalysis  
- Real-time cost calculations
- Component-level cost breakdown
- Multiple scenario comparisons
- Optimization recommendations

## API Integration

The frontend integrates with the ArchitectAI backend through:

- **Authentication**: JWT-based user authentication
- **Project Management**: CRUD operations for projects
- **Architecture Generation**: Real-time architecture creation
- **Cost Calculation**: Dynamic cost analysis
- **Template Library**: Pre-built architecture patterns

## Amazon Nova Integration

The frontend showcases all Nova model capabilities:

1. **Nova 2 Lite**: Requirements analysis and architecture reasoning
2. **Nova Canvas**: Professional diagram generation
3. **Nova Micro**: Fast cost optimization suggestions  
4. **Multimodal**: Document and image processing

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run test` - Run tests

### Code Quality

```bash
# Linting
npm run lint

# Type checking  
npm run type-check

# Format code (if Prettier is configured)
npm run format
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```bash
# Build Docker image
docker build -t architectai-frontend .

# Run container
docker run -p 3000:3000 architectai-frontend
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Architecture Features

### Requirements Processing
- Natural language understanding
- Multi-modal input support (text, documents, images)
- Constraints and preferences validation
- Real-time form validation

### Architecture Generation
- Real-time progress tracking
- Professional diagram rendering
- Component relationship visualization
- Cost-aware design recommendations

### Cost Analysis
- Real-time AWS pricing integration
- Component-level cost breakdown
- Multiple scenario modeling
- Optimization opportunity identification

### User Experience
- Responsive design for all devices
- Smooth animations and transitions
- Loading states and error handling
- Accessibility compliance (WCAG 2.1)

## Performance

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: API response caching with SWR
- **Bundle Analysis**: Built-in bundle analyzer

## Security

- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Built-in CSRF protection
- **Content Security Policy**: Restrictive CSP headers
- **Authentication**: Secure JWT token handling

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## Hackathon Demo

This frontend is specifically designed for the Amazon Nova Hackathon, showcasing:

- **Complete Nova Integration**: All 4 Nova models working together
- **Real Business Value**: Actual architecture generation with cost analysis
- **Professional Quality**: Production-ready code and design
- **Interactive Demo**: Engaging user experience for judges

### Demo Flow

1. **Requirements Input**: User describes their architecture needs
2. **AI Processing**: Nova models analyze and design architecture  
3. **Results Display**: Professional diagrams, costs, and implementation plans
4. **Optimization**: AI-powered suggestions for improvements

## License

MIT License - built for Amazon Nova Hackathon 2024

---

**Ready to revolutionize cloud architecture design with AI!** 🚀
