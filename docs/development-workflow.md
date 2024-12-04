# Development Workflow

## Dependencies
- Always update package.json first when adding dependencies
- Dependencies will auto-install when package.json is updated
- Avoid using individual npm install commands
- Use the latest stable versions of packages

## Development Server
- Use `npm run dev` for development
- Server automatically restarts when needed
- No need to manually restart for file changes
- Development server provides hot module replacement

## File Changes
- Follow proper diff formatting for file changes
- Ensure proper indentation and whitespace
- Include sufficient context in diffs
- Order hunks sequentially from top to bottom
- Verify changes build upon latest file versions

## Static Site Generation
- Include all required static params
- Test static generation before deployment
- Verify all dynamic routes are properly handled
- Ensure consistent ID formats across the application