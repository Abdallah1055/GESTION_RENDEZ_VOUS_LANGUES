# Language Lesson Booking System

A simple online language lesson booking website built with React (frontend), Laravel 12 (backend), MySQL, and Stripe for payment.

## Features

### For Guest (not logged in):
- View home page
- Search for formateurs (by name or language)
- View all available languages
- View list of formateurs and their details
- View available time slots of a formateur
- Cannot book sessions (requires login)
- Cannot access dashboards

### For Client (logged-in):
- Register an account
- Login / Logout
- View available languages
- Search for formateurs (by name or language)
- View available time slots
- Book sessions with Stripe payment (fixed 20€ per session)
- Cancel own reservations
- View booking history

### For Formateur (teacher):
- Register an account
- Login / Logout
- Cannot login until admin validates (is_verified = true)
- Manage availability (add/delete time slots)
- Cancel reservations on own time slots
- View list of students who booked
- Edit profile
- Add/remove languages taught

### For Administrator:
- Verify new formateur registrations (approve or reject)
- View all users
- Delete any user
- Add/remove available languages
- View statistics (number of clients, formateurs, reservations)

## Project Structure

```
preply-clone/
├── backend/ (Laravel 12)
│   ├── app/
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Language.php
│   │   │   ├── TimeSlot.php
│   │   │   └── Reservation.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── LanguageController.php
│   │   │   │   ├── FormateurController.php
│   │   │   │   ├── TimeSlotController.php
│   │   │   │   ├── ReservationController.php
│   │   │   │   └── AdminController.php
│   │   │   └── Middleware/
│   │   │       ├── IsAdmin.php
│   │   │       ├── IsFormateur.php
│   │   │       └── IsClient.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   ├── composer.json
│   └── .env.example
└── frontend/ (React + Vite)
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ClientDashboard.jsx
    │   │   ├── FormateurDashboard.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   └── FormateurDetail.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── FormateurCard.jsx
    │   │   ├── TimeSlotCard.jsx
    │   │   └── BookingModal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

## Installation Instructions

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18 or higher
- npm or yarn
- MySQL
- Stripe account (for payment processing)

### Backend Setup (Laravel)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Configure your `.env` file:
```env
APP_NAME="Language Booking"
APP_ENV=local
APP_KEY=your-generated-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=language_booking
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password

STRIPE_KEY=your_stripe_publishable_key
STRIPE_SECRET=your_stripe_secret_key

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

6. Create the MySQL database:
```sql
CREATE DATABASE language_booking;
```

7. Run migrations:
```bash
php artisan migrate
```

8. Run seeders (creates admin user and default languages):
```bash
php artisan db:seed
```

**Default Admin Credentials:**
- Email: admin@example.com
- Password: admin123

9. Start the Laravel development server:
```bash
php artisan serve
```

The backend API will be available at: `http://localhost:8000`

### Frontend Setup (React)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

5. Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Stripe Configuration

### Get Stripe Keys

1. Sign up for a Stripe account at https://stripe.com
2. Go to the Stripe Dashboard
3. Navigate to Developers > API keys
4. Copy your Publishable key (pk_test_...) and Secret key (sk_test_...)

### Configure Backend

Add your Stripe keys to `backend/.env`:
```env
STRIPE_KEY=pk_test_your_publishable_key
STRIPE_SECRET=sk_test_your_secret_key
```

### Configure Frontend

Add your Stripe publishable key to `frontend/.env`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
```

## Usage

### Testing as Guest

1. Open `http://localhost:5173` in your browser
2. Browse formateurs and search by name or language
3. View formateur details and available time slots
4. Try to book - you'll see a message to login

### Testing as Client

1. Click "Register" and create a client account
2. Login with your credentials
3. Search for formateurs and view their available slots
4. Book a session - you'll be redirected to Stripe payment
5. After payment, view your bookings in the Client Dashboard
6. Cancel your own reservations

### Testing as Formateur

1. Register as a formateur
2. Login as admin to approve the formateur
3. Login as the formateur
4. Add time slots in the Formateur Dashboard
5. Add languages you teach
6. View reservations from students
7. Cancel reservations on your slots

### Testing as Admin

1. Login with admin credentials (admin@example.com / admin123)
2. View statistics in Admin Dashboard
3. Approve or reject pending formateur registrations
4. View and delete any user
5. Add or remove languages from the platform

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (authenticated)
- `GET /api/me` - Get current user (authenticated)

### Public
- `GET /api/languages` - Get all languages
- `GET /api/formateurs` - Get all formateurs (with search/filter)
- `GET /api/formateurs/{id}` - Get formateur details
- `GET /api/time-slots` - Get time slots (with filters)

### Client (authenticated)
- `GET /api/reservations` - Get client's reservations
- `POST /api/reservations` - Create reservation with payment
- `POST /api/reservations/{id}/cancel` - Cancel own reservation

### Formateur (authenticated)
- `POST /api/time-slots` - Create time slot
- `DELETE /api/time-slots/{id}` - Delete time slot
- `PUT /api/formateur/profile` - Update profile
- `POST /api/formateur/languages` - Add language
- `DELETE /api/formateur/languages/{id}` - Remove language
- `GET /api/formateur/reservations` - Get formateur's reservations
- `POST /api/formateur/reservations/{id}/cancel` - Cancel reservation

### Admin (authenticated)
- `GET /api/admin/statistics` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/formateurs/{id}/verify` - Verify/reject formateur
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/pending-formateurs` - Get pending formateurs
- `POST /api/languages` - Add language
- `DELETE /api/languages/{id}` - Delete language

## Business Rules

1. Guest can see everything but CANNOT book (requires login)
2. Client must have an account to book a session
3. One reservation = one time slot only
4. A time slot cannot be booked twice (no double booking)
5. Formateur can cancel any reservation on his slots; Client only cancels his own
6. Each reservation has a status (confirmed or cancelled)
7. Each formateur can teach multiple languages
8. Formateur must be validated by admin before accessing the platform
9. Admin dashboard is secured (admin only)
10. Admin can delete or modify any content in the system
11. System prevents booking conflicts (two clients cannot book same slot)

## Payment Details

- Fixed amount: €20.00 per session
- Payment processed at the moment of booking
- Stripe test mode (sandbox) only
- Payment intent created and confirmed immediately

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure `CORS_ALLOWED_ORIGINS` in `backend/.env` includes your frontend URL.

### Database Connection Issues
- Ensure MySQL is running
- Verify database credentials in `.env`
- Ensure the database exists

### Stripe Payment Issues
- Verify your Stripe keys are correct
- Ensure you're using test mode keys (pk_test_*, sk_test_*)
- Check Stripe dashboard for payment logs

### Migration Issues
If migrations fail, try:
```bash
php artisan migrate:fresh
php artisan db:seed
```

## Development

### Backend
```bash
cd backend
php artisan serve
```

### Frontend
```bash
cd frontend
npm run dev
```

## License

This project is open source and available under the MIT License.
