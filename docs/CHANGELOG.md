# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2024-01-22

### Changed
- Updated `ProductList` component to use real product data from `products.ts`
- Removed hardcoded product list in `product-list.tsx`
- Dynamically generate product status and DPC status
- Improved product data rendering from centralized data source

### Refactored
- Simplified product list rendering logic
- Enhanced data mapping between product data and UI components

## [0.1.1] - 2023-12-04

### Fixed
- Static generation issues with product pages
- Updated `generateStaticParams` in product detail pages to include all required IDs
- Fixed product ID format consistency across the application
- Aligned product IDs between data layer and UI components

### Changed
- Updated product ID format from `PROD-YYYY-XXX` to `BAT-XXX` for consistency
- Standardized product ID references across components
- Improved product data structure in mock data

### Added
- Comprehensive documentation in `/docs` directory
- System specification documentation
- Development workflow guidelines
- Coding standards documentation
- UI guidelines
- Deployment documentation

## [0.1.0] - 2023-12-03

### Added
- Initial project setup
- Basic product management functionality
- Manufacturer dashboard
- Document management system
- Authentication system
- Admin interface
- Product verification system
- QR code generation
- Responsive UI components
- Tailwind CSS styling
- shadcn/ui components integration