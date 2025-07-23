# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.15] - 2025-07-23

### Enhanced GPSR Compliance in Document Guidance API
- **Improved OpenAI prompt for GPSR compliance**: Updated `/api/chatgpt/guidance` to focus on General Product Safety Regulation (GPSR) instead of ESPR
- **Added ESPR DPP assessment**: AI now evaluates if Digital Product Passport (DPP) is required under ESPR for the product category
  - Returns `dppRequired: true/false` boolean value based on clear criteria:
    * `true`: Products mandatory now OR planned for 2026, 2027, 2028, 2029, or 2030
    * `false`: Products NOT included in ESPR timeline through 2030
  - Provides `dppNotes` with explanation of DPP requirement and timeline
  - Evaluates key categories: Textiles (2026), Electronics/ICT (2026), Batteries (mandatory), Furniture (2027-2030), Iron/steel (2026), Chemicals (2026-2030), Food contact materials (2027-2030), Construction products (2027-2030)
- **DPP information display in UI**: Added DPP requirement cards in DocumentUploadStep
  - Shows orange warning card when DPP is required with ESPR compliance badge
  - Shows gray info card when DPP is not required
  - Displays DPP notes and timeline information to users
- **Updated ProductDocumentGuidance interface**: Added `dppRequired` boolean and `dppNotes` string fields in both API route and service files
- **Specific GPSR document lists**: Added predefined lists of mandatory and optional GPSR compliance documents
  - **Mandatory**: CE Declaration of Conformity, CE Certificate/Certification, Technical Documentation File, Risk Assessment Report, User Instructions and Safety Manual, Test Reports, Product Safety Assessment, Conformity Assessment Documentation, Manufacturing Quality Documentation
  - **Optional**: Additional Safety Testing Reports, Environmental Impact Assessment, Extended Durability Testing, Quality Management System Certificate, Post-Market Surveillance Plan, Traceability Documentation, Supply Chain Safety Documentation, Incident Response Procedures
- **Dual compliance expertise**: AI now acts as both GPSR and ESPR compliance expert
- **Improved fallback responses**: Updated default responses with GPSR-focused documents (CE Declaration, Technical Documentation, Risk Assessment) and ESPR DPP assessment

## [0.1.14] - 2025-07-23

### Added
- Implemented submenu support in dashboard sidebar navigation
- Added collapsible menu structure with expand/collapse functionality
- Added new menu organization: Dashboard, Product Management, Supply Chain Management, and Settings
- Added Product Management submenu with Products option
- Added Supply Chain Management submenu with Suppliers and My Products options
- Added visual indicators (chevron icons) for expandable menu items
- Added proper state management for submenu open/close states

### Changed
- Restructured dashboard menu to support hierarchical navigation
- Moved Products under Product Management submenu
- Moved Suppliers and Pending Products under Supply Chain Management submenu
- Renamed "Pending Products" to "My Products" for better clarity
- Updated translation files to include new menu structure in both English and Turkish
- Enhanced menu rendering logic to handle submenu visibility and filtering
- Improved mobile navigation to support submenu structure

### Fixed
- Fixed import order in dashboard layout component to resolve linter errors
- Ensured proper TypeScript typing for menu item interface
- Fixed menu highlighting logic to only highlight active/selected items instead of all items
- Fixed text overflow issues in menu items by adding proper truncation and flex layout
- Increased sidebar width from 256px to 288px to accommodate longer menu text
- Added proper hover states for menu items with subtle background highlighting
- Fixed parent menu items staying highlighted when clicked by removing background highlighting from submenu headers
- Added auto-expand functionality for submenus when child items are active
- Improved submenu state management to combine manual opens with auto-expanded items
- Refactored dashboard menu logic into a separate custom hook (`useDashboardMenu`) for better code organization
- Separated menu state management from layout component to improve maintainability and reusability
- Added icon mapping system to handle dynamic icon rendering in menu items
- Improved code structure by moving complex menu logic to dedicated hook
- Created separate `DashboardMenuItem` component to handle individual menu item rendering
- Extracted menu item rendering logic from layout component for better modularity
- Improved component reusability and testability by separating concerns
- Reduced layout component complexity by moving menu item logic to dedicated component

## [0.1.13] - 2025-07-23

### Fixed
- Fixed CompanyDocumentList component to properly fetch company documents using CompanyDocumentService
- Updated use-company-documents hook to use CompanyDocumentService instead of DocumentService
- Fixed document URL generation by properly mapping public URLs from Supabase storage
- Added missing manufacturer field to document mapping to prevent component errors
- Improved error handling in company document retrieval
- Fixed incorrect document view links in CompanyDocumentList component (was pointing to non-existent routes)
- Fixed document reupload links to point to correct routes
- Updated document view action to directly open document in new tab instead of navigating to separate page
- Updated document download action to use direct file download

### Added
- Created new document reupload page at `/dashboard/documents/[id]/reupload` for rejected documents
- Added comprehensive reupload functionality with file upload and document type selection
- Added proper error handling and validation for reupload process
- Added companyId field to Document type for better document management

### Changed
- Updated document status update mutation to use CompanyDocumentService.updateDocumentStatus method
- Enhanced document mapping to include proper public URLs for file access
- Updated document links to use correct routing structure

## [0.1.12] - 2025-07-23

### Added
- Created new `/auth/verify-email` page to properly inform users about email verification process
- Added comprehensive email verification flow with clear next steps
- Added Turkish and English translations for verify-email page
- Enhanced user experience by providing clear guidance after registration

### Changed
- Updated registration flow to redirect to verify-email page instead of showing generic success message
- Removed redundant success toast from registration process
- Improved user communication about email verification requirements
- Updated auth flow to better handle email confirmation process
- Simplified next steps by removing admin review and approval steps from verify-email page

### Fixed
- Fixed registration flow to properly inform users about email verification
- Resolved issue where users were not informed about email confirmation requirements
- Improved user experience by providing clear next steps after registration

## [0.1.11] - 2025-07-23

### Added
- Reorganized dashboard sidebar to include Settings as a main menu item
- Moved Documents and Certifications as tabs within Settings page
- Added Documents and Certifications tabs to Settings form
- Added document upload functionality to Documents tab in Settings
- Updated translation files to support new menu structure
- Enhanced accessibility by adding aria-label to select elements

### Changed
- Updated dashboard layout to remove Documents and Certifications as separate sidebar items
- Restructured Settings page to include Documents and Certifications management
- Changed default tab in Settings to Documents for better user experience
- Updated upload page navigation to redirect to Settings after successful upload
- Improved navigation structure for better user experience
- Added Supabase email confirmation security page at `/auth/approval` to safely handle confirmation URLs
- Added enhanced user onboarding flow at `/auth/callback` for invited suppliers to set passwords
- Added Content Security Policy (CSP) headers to allow Hedera blockchain API connections
- Improved Hedera SDK configuration with better error handling and browser compatibility
- Added environment variables for Hedera configuration
- Added retry and timeout settings for blockchain API calls
- Added fallback mechanism for blockchain queries to provide graceful error handling
- Added error field to blockchain record type for better debugging
- Added automatic image deletion when deleting products to prevent orphaned storage files
- Added hash fragment parameter extraction utilities to handle authentication URLs with hash fragments
- Updated callback page to handle both traditional query parameters and hash fragment parameters for authentication
- Improved authentication flow to work seamlessly with Supabase's redirect-based authentication

### Fixed
- Fixed Content Security Policy violation when connecting to Hedera testnet nodes
- Fixed blockchain transaction failures in browser environment
- Moved hardcoded credentials to environment variables for better security
- Reduced failed transaction attempts by optimizing client configuration
- Fixed "CostQuery has not been loaded yet" error in Hedera SDK by properly setting query payment
- Improved error handling in blockchain product history retrieval
- Enhanced ProductBlockchainRecord type to include productType and model properties
- Added better error messages for blockchain query failures
- Implemented robust fallback for failed contract queries to prevent UI errors
- Fixed translation keys in CompanyDocumentList component when moved to Settings tab
- Added missing table column translations (category, status, validUntil, issuer) to both English and Turkish translation files
- Updated component to use correct translation keys for table headers

## [Previous Unreleased Features]
- Added support for product subcategories based on selected product type
- Implemented dynamic subcategory dropdown in product form
- Added comprehensive subcategories for childcare products, footwear, detergents, other consumer products, toothbrushes, electrical equipment, food products, food contact materials, prepackaging, paper products, stationery, chemical and organic fertilizers, personal protective equipment, cosmetics, toys, batteries and accumulators, textile products, and telecommunications equipment
- Updated product type select options with comprehensive list of product categories
- Extracted product type options to a constants file for better maintainability
- Improved product type values with descriptive English identifiers instead of numeric IDs
- Enhanced database schema to include product subcategory field

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
- shadcn/ui components integration

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