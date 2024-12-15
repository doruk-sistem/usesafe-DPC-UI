şimdi ben sana bizim olması gereken yapımızı açıklayayım.

product tablosunda product basic bilgileri (id, name, description, create date, update date vs.) tutulacak. şirket bilgisi tutulacak. resimler olacak, status tutulacak. tipi tutulacak.  Bir de key features var. bu key fatures genişlemeyebilir. örneğin bateri de voltage, capacity, dimensions olabilecekken, ürün tekstil ürünü ise kumaşı vs gibi şeyler olabilir. o yüzden key features sabit değerler yerine çoklu bir liste yapısı olsun.

bir de dpp şablonu için tablo lazım. dpp şablonu product'ın tipine göre değişecek. yani product tipi ile dpp şablonu bağlantılı olacak. Bu product tipi - dpp şablonu bağlantısını admin yapacak bizim için şu an standart 3-4 tane product tipi olsa yeterli. önemli olan ürün product tipi seçilince ürünün dpp şablonu da seçilmiş olacak. dpp şablonun içerisinde Hazard Pictograms detayları, Materials detayları, Health and Safety Measures detayları, Emergency Procedures detayları, Storage and Installation Guidelines detayları, yüklenmesi zorunlu ve opsiyonel olan Certifications detayları olacak.

bir de dpp tablomuz olması lazım. bu tamamen productların her bir bireyine ait olacak. serial number, üretim tarihi, qr kod bilgileri bunun üzerinde olacak. ama dpp hem product, hem dpp şablonuna referansı olacak.

bir product tipi seçince biz arka planda bu product product tipleri ile dpp şemaları arasındaki bağlantıyı tuttuğumuz için product detayında bu bilgileri göstebileceğiz. ama dpp şeması içerisindeki hiç bir bilgiyi product oluştururken ya da editlerken girmeyecek. O bilgiler dpp şeması içerisinde olacak.

Create database tables and necessary UI changes for a product management system with the following structure:

1. Product Table:
- id (PK)
- name
- description
- company_id (FK)
- product_type_id (FK)
- status
- created_at
- updated_at
- images (array/json)
- key_features (jsonb - flexible key-value structure)

2. ProductType Table:
- id (PK)
- name
- description
- created_at
- updated_at

3. DPPTemplate Table:
- id (PK)
- product_type_id (FK)
- hazard_pictograms (jsonb)
- materials (jsonb)
- health_safety_measures (jsonb)
- emergency_procedures (jsonb)
- storage_installation_guidelines (jsonb)
- required_certifications (jsonb)
- optional_certifications (jsonb)
- created_at
- updated_at

4. DPP Table:
- id (PK)
- product_id (FK)
- template_id (FK)
- serial_number
- manufacturing_date
- qr_code
- created_at
- updated_at

Include appropriate indexes and constraints for all foreign key relationships and ensure proper data types for each field.

As a database architect and UI designer, please implement a comprehensive product management system with the following specifications:

Database Requirements:
1. Create the following tables with appropriate data types, constraints, and indexes:

Product Table:
- id (BIGSERIAL PRIMARY KEY)
- name (VARCHAR(255) NOT NULL)
- description (TEXT)
- company_id (BIGINT NOT NULL REFERENCES companies(id))
- product_type_id (BIGINT NOT NULL REFERENCES product_types(id))
- status (VARCHAR(50) NOT NULL DEFAULT 'draft')
- created_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
- images (JSONB)
- key_features (JSONB)
Add indexes on: company_id, product_type_id, status
Add constraint: status IN ('draft', 'active', 'archived', 'discontinued')

ProductType Table:
- id (BIGSERIAL PRIMARY KEY)
- name (VARCHAR(255) NOT NULL UNIQUE)
- description (TEXT)
- created_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
Add index on: name

DPPTemplate Table:
- id (BIGSERIAL PRIMARY KEY)
- product_type_id (BIGINT NOT NULL REFERENCES product_types(id))
- hazard_pictograms (JSONB NOT NULL DEFAULT '{}')
- materials (JSONB NOT NULL DEFAULT '{}')
- health_safety_measures (JSONB NOT NULL DEFAULT '{}')
- emergency_procedures (JSONB NOT NULL DEFAULT '{}')
- storage_installation_guidelines (JSONB NOT NULL DEFAULT '{}')
- required_certifications (JSONB NOT NULL DEFAULT '[]')
- optional_certifications (JSONB NOT NULL DEFAULT '[]')
- created_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
Add index on: product_type_id

DPP Table:
- id (BIGSERIAL PRIMARY KEY)
- product_id (BIGINT NOT NULL REFERENCES products(id))
- template_id (BIGINT NOT NULL REFERENCES dpp_templates(id))
- serial_number (VARCHAR(100) NOT NULL UNIQUE)
- manufacturing_date (DATE NOT NULL)
- qr_code (VARCHAR(255) NOT NULL UNIQUE)
- created_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
Add indexes on: product_id, template_id, serial_number, qr_code

UI Requirements:
1. Create responsive forms for:
- Product creation/editing with image upload capability
- ProductType management
- DPPTemplate configuration with dynamic JSON fields
- DPP generation with QR code support

2. Implement:
- Data validation for all forms
- Real-time preview for JSON editors
- Image upload with preview and multiple file support
- QR code generator for DPP entries
- Searchable dropdown menus for foreign key relationships

3. Add necessary API endpoints for CRUD operations on all tables

Please provide the SQL schema creation scripts and basic UI component structure following these specifications.