# Frontend Guidelines
 
## Stack
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS
 
## Patterns
- Use server components by default
- Client components only when needed (interactivity)
- API calls go through `/lib/api.ts`
 
## Component Structure
- `/components` - Reusable UI components
- `/app` - Pages and layouts
 
## API Client
All backend calls should use the api client:
 
import { api } from '@/lib/api'
const tasks = await api.getTasks()
 
## Styling
- Use Tailwind CSS classes

## Auth Integration
- All API calls must include JWT token from Better Auth:
  Authorization: Bearer <token>
- Only show data for the authenticated user.

## Claude Frontend Dev Instructions
- Act as Frontend_Dev_Agent
- Read relevant specs before creating components/pages
- Follow existing component naming conventions and patterns
- Always use Tailwind CSS classes; avoid inline styles

 No inline styles
- Follow existing component patterns

## MCP Server
- Next.JS MCP name next-devtools for Next.JS configurations
- ShadcnUI MCP for UI components
- Better Auth MCP for authentication
- Context7 MCP for Claude context management