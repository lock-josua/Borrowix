# Borrowix

**A multi-tenant ICT equipment borrowing management system for educational institutions.**

Borrowix is a comprehensive platform that enables schools and educational organizations to manage the borrowing, tracking, and return of ICT equipment (computers, projectors, cameras, etc.). Built on Laravel 12 with a modern React frontend, it supports role-based access for students, staff, and administrators, with tenant isolation through a multi-tenancy architecture.

## Table of Contents

- [What This Is](#what-this-is)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Database Migrations](#database-migrations)
- [Testing](#testing)
- [How It Fits Together](#how-it-fits-together)
- [Troubleshooting](#troubleshooting)

---

## What This Is

Borrowix solves the challenge of managing shared ICT equipment across school departments and student borrowing workflows. It provides a complete borrowing lifecycle system — from equipment inventory management and student requests, through staff approval and issuing, to return processing with damage assessment and overdue fine tracking. The platform uses QR codes for fast equipment scanning and supports subscription-based access for school tenants.

---

## Tech Stack

- **Languages:** TypeScript (67.7%), PHP (27.3%), Blade (3.5%), CSS (1.4%), JavaScript (0.1%)
- **Framework / runtime:** Laravel 12 + React 19 with Inertia.js for full-stack SSR
- **Notable libraries:**
  - **Backend:** Laravel Fortify (auth), Spatie Permissions (RBAC), Stancl Tenancy (multi-tenancy), DomPDF (reports), PayPal SDK (payments)
  - **Frontend:** Radix UI + Tailwind CSS (component system), Framer Motion (animations), React Hook Form + Zod (forms/validation), Recharts (data visualization)
  - **Storage & Media:** Cloudinary integration for image uploads, QR code generation (qrcode + html5-qrcode)

---

## Project Structure

```
borrowix/
├── app/
│   ├── Http/
│   │   ├── Controllers/       HTTP handlers for all routes (Admin, Staff, Student, Auth)
│   │   ├── Middleware/        Custom middleware (tenancy, auth, permissions)
│   │   └── Requests/          Form request validation
│   ├── Models/                Eloquent models (Equipment, BorrowRequest, BorrowTransaction, User, Tenant, etc.)
│   ├── Actions/               Business logic actions
│   ├── Services/              Reusable service classes
│   ├── Enums/                 PHP enums (EquipmentStatus, BorrowRequestStatus, BorrowTransactionStatus)
│   ├── Notifications/         Database notifications (BorrowRequestApproved, BorrowRequestRejected)
│   ├── Exports/               Excel export classes
│   ├── Mail/                  Mail templates
│   └── Providers/             Service providers
│
├── routes/
│   ├── web.php                Central domain routes (registration, auth, Google OAuth)
│   ├── Admin.php              Superadmin panel routes
│   ├── Staff.php              Staff/library routes
│   ├── Student.php            Student routes
│   ├── Superadmin.php         Superadmin-only routes
│   ├── Api.php                JSON API endpoints
│   ├── tenant.php             Main tenant application routes
│   └── settings.php           Settings routes
│
├── resources/
│   ├── js/
│   │   ├── pages/             Inertia pages (organized by role)
│   │   ├── components/        Reusable React components
│   │   ├── layouts/           Layout wrappers (AdminLayout, StaffLayout, StudentLayout)
│   │   ├── lib/               Utility functions
│   │   ├── hooks/             Custom React hooks
│   │   └── types/             TypeScript interfaces
│   ├── css/                   Tailwind CSS
│   └── views/                 Blade templates (minimal)
│
├── database/
│   ├── migrations/            Database schema
│   ├── factories/             Model factories
│   └── seeders/               Database seeders
│
├── config/
│   ├── tenancy.php            Multi-tenancy configuration
│   └── fortify.php            Authentication configuration
│
├── public/                    Static assets
├── storage/                   Logs, cache, uploads
├── tests/                     PHPUnit and Pest tests
├── bootstrap/                 Application bootstrap
├── .env.example               Environment variables template
├── composer.json              PHP dependencies
├── package.json               Node.js dependencies
├── vite.config.ts             Vite configuration
└── phpunit.xml                PHPUnit configuration
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **PHP 8.2+** — [Download PHP](https://www.php.net/downloads)
- **Composer** — [Install Composer](https://getcomposer.org/doc/00-intro.md)
- **Node.js 18+** — [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — [Download Git](https://git-scm.com/)
- **SQLite** (optional, included in PHP) OR **MySQL 8.0+**

**Verify installations:**

```bash
php --version
composer --version
node --version
npm --version
git --version
```

---

## Installation & Setup

Follow these step-by-step instructions to get Borrowix running locally.

### Step 1: Clone the Repository

```bash
git clone https://github.com/lock-josua/Borrowix.git
cd Borrowix
```

### Step 2: Install PHP Dependencies

```bash
composer install
```

This reads `composer.json` and installs all Laravel packages and dependencies.

### Step 3: Copy Environment Configuration

```bash
cp .env.example .env
```

This creates your `.env` file with default configuration. Review it for your setup.

### Step 4: Generate Application Key

```bash
php artisan key:generate
```

This generates a unique `APP_KEY` for encryption and sessions. You should see:
```
Application key set successfully.
```

### Step 5: Configure Your Database

Edit `.env` and set your database connection. The default is SQLite (recommended for local development).

**Option A: SQLite (Recommended for Local Development)**

```dotenv
DB_CONNECTION=sqlite
# DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD are not used for SQLite
```

Ensure the SQLite database file exists:

```bash
touch database/database.sqlite
```

**Option B: MySQL**

If using MySQL, first create the database:

```bash
mysql -u root -p
CREATE DATABASE borrowix;
exit;
```

Then update `.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=borrowix
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Step 6: Configure Application Settings (Optional)

Edit `.env` to customize:

```dotenv
APP_NAME=Borrowix
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

# Email configuration (for local development, use 'log' to send emails to logs)
MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="Borrowix"

# Cloudinary (for image uploads) - get from https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PayPal (for subscription payments) - use sandbox for testing
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret

# Google OAuth (optional, for login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 7: Run Database Migrations

Migrations create all necessary tables in your database.

```bash
php artisan migrate
```

You should see output like:

```
  Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables ........... 2ms PASS
  ...
  
  Migration table created successfully.
  Migrating: 2019_12_14_000001_create_personal_access_tokens_table
  Migrated: 2019_12_14_000001_create_personal_access_tokens_table (3.20ms)
  Migrating: 2024_..._create_users_table
  Migrated: 2024_..._create_users_table (4.50ms)
  ...
  
  Done.
```

### Step 8: Seed the Database (Optional)

Populate the database with sample data for testing:

```bash
php artisan db:seed
```

This creates:
- Default superadmin user
- Sample equipment categories
- Sample equipment items
- Test users (students, staff)

### Step 9: Install Node.js Dependencies

```bash
npm install
```

This installs all frontend packages (React, Tailwind, etc.) from `package.json`.

### Step 10: Build Frontend Assets

```bash
npm run build
```

This compiles your React, TypeScript, and Tailwind CSS for production.

### (Alternative) Run Setup Script Automatically

If you prefer to run all these steps at once:

```bash
composer setup
```

This runs the `setup` script defined in `composer.json`, which automates steps 3–10.

---

## Running the Application

### Development Mode (Recommended)

Start the Laravel server, queue worker, and Vite dev server all at once:

```bash
composer run dev
```

This uses `concurrently` to run three processes:
- **Laravel dev server** (`php artisan serve`) — runs on `http://localhost:8000`
- **Queue worker** (`php artisan queue:listen`) — processes background jobs
- **Vite dev server** — hot-reloads frontend changes

You should see:

```
$ concurrently -c "#93c5fd,#c4b5fd,#fdba74" "php artisan serve" "php artisan queue:listen --tries=1" "npm run dev" --names='server,queue,vite'

server  | Laravel development server started: http://127.0.0.1:8000
queue   | Processing jobs from all queues as they're dispensed
vite    | VITE v7.0.4  ready in 245 ms
vite    | ➜  Local:   http://localhost:5173/
```

**Access the application:**

Open your browser and go to: `http://localhost:8000`

### Development with SSR (Server-Side Rendering)

If you want to test server-side rendering:

```bash
composer run dev:ssr
```

This adds Inertia's SSR daemon and Pail logging to the mix.

### Manual Development (Without Concurrently)

If you prefer running processes separately:

**Terminal 1 — Laravel Server:**
```bash
php artisan serve
```

**Terminal 2 — Queue Worker:**
```bash
php artisan queue:listen --tries=1
```

**Terminal 3 — Vite Dev Server:**
```bash
npm run dev
```

### Production Build & Deployment

```bash
npm run build
php artisan optimize
php artisan config:cache
php artisan route:cache
```

Then serve with a proper web server (nginx, Apache).

---

## Database Migrations

### Understanding Migrations

Migrations are PHP files that describe your database schema. They live in `database/migrations/` and are timestamped.

### Create a New Migration

If you need to add tables or columns:

```bash
php artisan make:migration create_table_name --create=table_name
```

Or modify an existing table:

```bash
php artisan make:migration add_column_to_table_name --table=table_name
```

### Run Migrations

```bash
# Run all pending migrations
php artisan migrate

# Roll back the last batch
php artisan migrate:rollback

# Roll back all migrations
php artisan migrate:reset

# Roll back and re-run all migrations
php artisan migrate:refresh

# Roll back all migrations and re-seed the database
php artisan migrate:refresh --seed
```

### Fresh Start

To completely wipe and rebuild the database:

```bash
php artisan migrate:fresh --seed
```

⚠️ **Warning:** This deletes all data!

---

## Testing

### Run Tests

```bash
composer run test
```

This runs:
1. **Linting (Pint)** — checks PHP code style
2. **PHPUnit/Pest** — runs the full test suite

### Run Tests Individually

```bash
# Run linting only
composer run test:lint

# Run PHPUnit tests only
php artisan test

# Run specific test file
php artisan test tests/Feature/EquipmentTest.php

# Run tests with coverage
php artisan test --coverage
```

---

## How It Fits Together

### User Flows

1. **Registration (Central Domain)**
   - User goes to `https://huwam.com/register`
   - Creates account via Laravel Fortify or Google OAuth
   - School is assigned a unique tenant (subdomain: `school.huwam.com`)

2. **Login & Role-Based Redirect**
   - User logs in on central domain
   - `RoleRedirectController` routes them to their role dashboard:
     - **Super Admin** → `/admin/dashboard`
     - **Staff** → `/staff/dashboard`
     - **Student** → `/student/dashboard`

3. **Equipment Browsing (Student)**
   - Student browses equipment at `/student/browse`
   - Sees equipment with images, availability, and categories
   - Clicks "Borrow" to open `BorrowRequestModal`

4. **Submitting a Borrow Request**
   - Student fills out form: equipment, purpose, borrow date, return date
   - Request is created with status `pending`
   - Notification sent to staff for approval

5. **Request Approval (Staff)**
   - Staff reviews pending requests at `/staff/requests`
   - Approves or rejects with remarks
   - On approval:
     - `BorrowTransaction` is created
     - Equipment `available_quantity` is decremented
     - Student receives notification

6. **Equipment Issue**
   - Staff scans QR code or manually issues equipment
   - `issued_at` timestamp recorded
   - Staff member (`issued_by`) recorded

7. **Equipment Return**
   - Student returns equipment to staff
   - Staff scans QR or searches transaction
   - Records return condition, damage photos
   - If damage, calculates fine based on equipment condition
   - `BorrowTransaction` status updated to `Returned`

8. **Multi-Tenancy**
   - Stancl Tenancy middleware isolates data by tenant
   - Each school sees only their equipment and transactions
   - Subscriptions managed at admin level

---

## Troubleshooting

### "Composer install" fails

**Problem:** PHP version mismatch or missing extensions.

**Solution:**
```bash
# Check PHP version (must be 8.2+)
php --version

# Install missing extensions (on Ubuntu/Debian):
sudo apt-get install php8.2-sqlite3 php8.2-gd php8.2-zip php8.2-curl

# Clear composer cache
composer clear-cache
composer install
```

---

### "npm install" fails

**Problem:** Node.js version too old or npm cache corrupted.

**Solution:**
```bash
# Check Node.js version (must be 18+)
node --version

# Clear npm cache
npm cache clean --force
npm install
```

---

### "php artisan migrate" fails

**Problem:** Database connection error or permission issue.

**Solution:**

**For SQLite:**
```bash
# Ensure database file exists
touch database/database.sqlite

# Check permissions
chmod 666 database/database.sqlite
chmod 755 database/

# Test connection
php artisan tinker
>>> DB::connection()->getPdo()
```

**For MySQL:**
```bash
# Verify MySQL is running
mysql -u root -p

# Check .env credentials
cat .env | grep DB_

# Try manual connection
mysql -h 127.0.0.1 -u root -p borrowix -e "SHOW TABLES;"
```

---

### "npm run dev" doesn't hot-reload

**Problem:** Vite not watching files.

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart Vite
npm run dev

# If still stuck, check for port conflicts
lsof -i :5173
```

---

### "php artisan serve" port 8000 already in use

**Problem:** Another process is using port 8000.

**Solution:**
```bash
# Use a different port
php artisan serve --port=8001

# Or find and kill the process
lsof -i :8000
kill -9 <PID>
```

---

### Can't log in after seeding

**Problem:** Seeded users not created properly.

**Solution:**
```bash
# Re-run seeders
php artisan db:seed

# Or check if user exists
php artisan tinker
>>> App\Models\User::count()
>>> App\Models\User::first()

# Manually create a user
php artisan tinker
>>> App\Models\User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => bcrypt('password')])
```

---

### Cloudinary images not uploading

**Problem:** Missing or incorrect Cloudinary credentials.

**Solution:**
```bash
# Update .env with correct credentials from https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Clear config cache
php artisan config:clear

# Test upload in tinker
php artisan tinker
>>> use Cloudinary\Cloudinary;
>>> $cld = new Cloudinary();
>>> $result = $cld->uploadApi()->upload('/path/to/image.jpg');
```

---

### Multi-tenancy not working

**Problem:** Tenancy middleware not recognizing tenant.

**Solution:**
```bash
# Check tenancy config
cat config/tenancy.php

# Verify tenant exists
php artisan tinker
>>> App\Models\Tenant::all()

# Check current tenant
>>> tenant()

# Manually set tenant
>>> $tenant = App\Models\Tenant::first();
>>> tenancy()->initialize($tenant);
```

---

## Additional Commands

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear

# Generate Eloquent model documentation
php artisan ide-helper:generate

# Create a new model with migration
php artisan make:model ModelName -m

# Create a new controller
php artisan make:controller ControllerName

# Create a new middleware
php artisan make:middleware MiddlewareName

# Run specific test
php artisan test --filter=TestName

# Export database to SQL file
php artisan db:export path/to/export.sql

# Fresh install (wipes and rebuilds everything)
php artisan migrate:fresh --seed
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a pull request

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

## Support

For issues, questions, or contributions, please open an issue on [GitHub Issues](https://github.com/lock-josua/Borrowix/issues).

---

**Happy borrowing! 🚀**
