# Coding Standards

## File Organization
- Create small and focused files
- Break down large files into multiple smaller modules
- Each file should have a single, clear responsibility
- Extract reusable logic into separate utility files

## Code Style
- Use early returns for better readability
- Use Tailwind classes for styling HTML elements
- Avoid using raw CSS or HTML tags
- Use descriptive variable and function names
- Event handlers should be prefixed with "handle" (e.g., handleClick, handleKeyDown)
- Use consts instead of functions where appropriate
- Define TypeScript types whenever possible

## Accessibility
- Implement proper accessibility attributes:
  - tabindex="0" for interactive elements
  - aria-label for meaningful descriptions
  - Proper keyboard event handlers
  - ARIA roles where appropriate

## Component Best Practices
- Use "use client" directive for components with client-side hooks
- Avoid components that trigger "Extra attributes from server" warnings
- Keep components focused and maintainable
- Extract reusable UI elements into separate components
- Use proper TypeScript types for props and state