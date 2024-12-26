# DPP (Digital Product Passport) Management System

## Overview
The DPP Management System allows company users to create, manage, and track digital product passports for their products. Each product can have multiple DPPs, each with unique identifiers and manufacturing information.

## Features

### DPP Creation
- Create new DPPs for existing products
- Auto-generate QR codes for each DPP
- Assign unique serial numbers
- Record manufacturing date and facility information

### DPP Management
- View list of all DPPs for the company
- Filter and search DPPs
- Update DPP information
- View QR codes and verification links

### Data Structure
Each DPP contains:
- Product reference
- Serial number (unique)
- Manufacturing date
- Manufacturing facility
- QR code (auto-generated)
- Template reference (based on product type)
- Creation/update timestamps

## User Interface Requirements

### DPP List View
- Tabular view of all DPPs
- Columns:
  - Serial Number
  - Product Name
  - Manufacturing Date
  - Facility
  - Status
  - Actions (View/Edit)
- Filtering and sorting capabilities
- Pagination

### DPP Creation Form
- Product selection
- Serial number input (with validation)
- Manufacturing date picker
- Facility information
- Auto-generated QR code preview

### DPP Detail View
- Complete DPP information
- QR code display
- Product details
- Template information
- Edit capabilities

## Access Control
- Only authenticated company users can access DPP management
- Users can only view/manage DPPs for their company 