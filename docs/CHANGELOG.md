# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.10] - 2024-03-21

### Added
- Integrated DPP Configurator into product form
- Added default DPP sections and fields
- Added required DPP sections handling
- Enhanced product form with two-step wizard

### Changed
- Updated product form to use DPP Configurator
- Improved DPP configuration interface
- Enhanced form validation for DPP fields

## [0.1.9] - 2024-03-20

### Added
- Two-step product registration process
- DPP configuration with drag-and-drop interface
- Split screen interface for DPP element management
- Support for mandatory and optional DPP fields
- Enhanced product form with progress indicator
- QR code generation for products

### Enhanced
- Product form with image upload capabilities
- Product type definitions with DPP support
- Product service with QR code generation

### Changed
- Updated product form to use two-step wizard
- Enhanced product types with DPP configuration
- Improved form validation for DPP fields

## [0.1.8] - 2024-12-10

### Added
- Updated product form schema with dynamic key features
- Added support for multiple product images
- Enhanced type definitions for product features
- Improved form validation for new product structure

### Changed
- Updated database schema for flexible product management
- Added Row Level Security policies for data protection
- Implemented key_features as dynamic JSON array
- Enhanced product types with proper validation
- Added company-specific product management
- Improved image handling with JSON structure

### Fixed
- Added robust error handling for Supabase storage bucket uploads
- Improved image upload validation in product creation flow
- Added explicit bucket existence check before file upload

### Enhanced
- Product form with image upload capabilities
- Storage service for managing product images
- Product creation flow with image handling

## [0.1.7] - 2024-12-05

### Added
- Comprehensive database schema for product management
- Product types and DPP templates tables
- DPP generation with QR code support
- Database triggers for timestamp updates
- Type definitions for database entities
- DPP service with CRUD operations
- DPP template form component
- QR code generation functionality

## [0.1.7] - 2024-12-05

### Added
- New product creation page with form validation
- Product form component with comprehensive fields
- Client-side validation using Zod
- Proper error handling and success notifications
- Responsive form layout

### Fixed
- Added proper Supabase type definitions
- Fixed product service queries
- Fixed NEXT_NOT_FOUND error for new product page

## [0.1.6] - 2024-12-05

### Added
- Image upload functionality using Supabase Storage
- Product image preview in form
- Image upload service with error handling
- Automatic image URL generation
- Secure file storage with company-specific paths

### Enhanced
- Product form with image upload capabilities
- Storage service for managing product images
- Product creation flow with image handling

- New product creation page with form validation
- Product form component with comprehensive fields
- Client-side validation using Zod
- Proper error handling and success notifications
- Responsive form layout

### Fixed
- Added proper Supabase type definitions
- Fixed product service queries
- Fixed NEXT_NOT_FOUND error for new product page

### Added
- Company-specific product listing page
- Real-time product data fetching from Supabase
- Loading states and error handling
- Empty state handling
- Responsive product filtering and search
- Enhanced product table with sorting capabilities
- Supabase integration for product management
- Company-specific product CRUD operations
- Product service with data access controls
- Custom hooks for product management
- Type definitions for Supabase tables
- Proper error handling for product operations

## [0.1.5] - 2024-12-05

### Added
- Authentication state management with React Context
- User navigation component with dropdown menu
- Secure token handling and verification
- Automatic authentication status check
- Sign out functionality
- User profile display in navigation

### Changed
- Updated navbar to show user profile when authenticated
- Wrapped application with AuthProvider
- Enhanced navigation UI for authenticated users

## [0.1.4] - 2024-12-05

### Enhanced
- Comprehensive refactoring of Product Details page
- Modular component architecture for product details
- Advanced motion and interaction design
- Improved code organization and maintainability

### Added
- Separate components for different product detail sections:
  - ProductImageGallery
  - ProductHeader
  - ProductQuickInfo
  - ProductKeyFeatures
  - BasicInformationCard
  - TechnicalSpecificationsCard
  - HazardPictogramsCard
  - MaterialsCard
  - EmergencyProceduresCard
  - CertificationsCard
  - SustainabilityMetricsCard

### Improved
- Landing page design with more engaging animations
- Enhanced feature sections with dynamic components
- Added sophisticated motion design
- Refined typography and color gradients
- Implemented advanced interaction effects
- Improved accessibility and user experience

### Refactored
- Modularized product details page
- Implemented consistent design system
- Enhanced type safety and component props
- Improved code readability and maintainability

## [0.1.3] - 2024-12-05

### Added
- Enhanced UI components with motion and interactive design
- Implemented design system with reusable components
- Added gradient and hover effects across dashboard
- Created enhanced card and metric components
- Improved overall user experience with subtle animations

### Improved
- Dashboard design consistency
- Performance optimization
- Accessibility features

## [0.1.2] - 2024-12-04

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
- shadcn/ui components integration## [Unreleased]

### Changed
- Converted template detail and preview pages to client components
- Implemented dynamic template loading from Supabase
- Added loading states and error handling for template pages
- Enhanced template preview with dynamic field rendering

### Removed
- Removed static template data and generateStaticParams

### Added
- Added DPPTemplate and DPPTemplateField type definitions
- Improved type safety in template components
- Enhanced error handling and null checks

### Fixed
- Fixed type issues in template pages
- Added proper null checks for template data
- Improved error message styling

### Enhanced
- Improved error handling in DPPTemplateService
- Added toast notifications for template operations
- Enhanced type safety in template hooks
- Better handling of empty states and error cases

### Fixed
- Fixed error handling in template service
- Improved error messages and user feedback
- Added proper null checks and type guards