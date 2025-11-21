---
name: react-review
description: Analyze React component for performance, patterns, and UX
---

# Task
Review the selected React component for:

## React Patterns
- [ ] Proper hooks usage (useState, useEffect, useQuery)
- [ ] TanStack Query integration with `enabled: !!session`
- [ ] Auth checking with `useAuth()` hook
- [ ] Theme context with `useTheme()` hook
- [ ] Abort signal forwarding: `queryFn: ({ signal }) => service.getData({ signal })`

## Performance
- [ ] Unnecessary re-renders (memo, useMemo, useCallback)
- [ ] Query key structure follows `queryKeys.feature.list()`
- [ ] Proper staleTime configuration (5 minutes default)
- [ ] Loading states with `<Loading pageName="..." />`

## UI/UX
- [ ] Error handling with user-friendly messages
- [ ] Loading indicators during async operations
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Theme compatibility (light/dark mode)

## Code Quality
- [ ] Named imports: `import { service } from '../services/feature.js'`
- [ ] Proper component structure and separation of concerns
- [ ] No console.log in production code
- [ ] Consistent styling with Tailwind CSS

Suggest improvements with code examples.
