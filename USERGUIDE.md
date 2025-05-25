# User Guide: Advocate AI Platform

## 1. Introduction

Welcome to the Advocate AI Platform! This project implements a comprehensive role-based authentication system using Supabase, featuring an admin approval workflow for new user registrations. Key features include:

-   User sign-up with email verification.
-   Admin panel for user management and account approval/rejection.
-   Role-based access control (RBAC) distinguishing between regular users and administrators.
-   In-app notifications, including a specific notification upon account approval.
-   Modern UI components with animations and toast notifications for enhanced user experience.

This guide will walk you through setting up and running the project locally.

## 2. Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js and npm (or yarn):** Download from [nodejs.org](https://nodejs.org). npm is included with Node.js. Yarn can be installed separately if preferred.
-   **A Supabase Account:** Sign up for free at [supabase.com](https://supabase.com).
-   **Git:** Download from [git-scm.com](https://git-scm.com).

## 3. Supabase Project Setup

### 3.1. Create a New Supabase Project

1.  Go to your Supabase Dashboard ([app.supabase.com](https://app.supabase.com)).
2.  Click on **"New project"**.
3.  Choose an organization (or create one).
4.  Fill in the project details:
    -   **Name:** e.g., "Advocate AI"
    -   **Database Password:** Generate a strong password and save it securely.
    -   **Region:** Choose the region closest to you or your users.
    -   **Pricing Plan:** The free tier is sufficient for development.
5.  Click **"Create new project"**. Wait for your project to be provisioned.

### 3.2. Obtain Project URL and Anon Key

Once your project is ready:

1.  In the Supabase Dashboard, navigate to your project.
2.  In the left sidebar, go to **Project Settings** (the gear icon).
3.  Click on **"API"**.
4.  You will find:
    -   **Project URL** (under "Configuration" -> "URL")
    -   **Project API Keys** (under "Project API Keys" -> "public" / "anon key")
5.  Copy these two values. You will need them for your local `.env.local` file.

### 3.3. Database Schema Setup (Applying SQL Migrations)

To set up your database schema, you will use the SQL Editor within your Supabase project dashboard. For each SQL file listed below, you need to:
1. Navigate to the **SQL Editor** in your Supabase project (usually found via a SQL or database icon in the sidebar).
2. Click on **"+ New query"** (or a similar button to open a new query tab).
3. Open the respective `.sql` file from the project's `supabase/` directory (or copy its content if provided directly).
4. Paste the entire content of the SQL file into the query editor.
5. Click the **"Run"** button (often a play icon).
6. Wait for the query to complete successfully before moving to the next file. It's crucial to run these scripts **one by one and in the specified order** to ensure database integrity and correct setup of dependencies (like tables before triggers or RLS policies).

    1.  **`supabase_migrations.sql`**: Creates the `public.profiles` table (for user profile data extending `auth.users`) and the trigger function `sync_profile_email_verification` to keep `profiles.email_verified` in sync with `auth.users.email_confirmed_at`.
    2.  **`supabase_user_notifications_table.sql`**: Creates the `public.user_notifications` table for storing in-app notifications.
    3.  **`supabase_approval_notification_trigger.sql`**: Creates the trigger function `create_approval_notification_trigger_func` and the trigger `on_profile_approved_create_notification` to automatically generate an in-app notification when a user's account is approved.
    4.  **`supabase_rls_policies.sql`**: Enables RLS on the `profiles` table and adds policies allowing users to read and update their own profile information (within limits).
    5.  **`supabase_admin_rls_policy.sql`**: Adds an RLS policy to the `profiles` table granting full CRUD access to users identified as administrators (role = 'admin').
    6.  **`supabase_user_notifications_rls.sql`**: Enables RLS on the `user_notifications` table and adds policies allowing users to read their own notifications and update their `is_read` status. Also includes an admin full access policy.

    *Reference:*
    -   `supabase_example_data_rls_policies.sql`: This file is not for direct execution during setup. It provides example RLS policies for any new data tables you might create in the future that require similar user-specific access controls.

    Ensure each script runs successfully before proceeding to the next.

### 3.4. (Recommended) Create an Initial Admin User

To manage user approvals, you'll need an admin account.

1.  **Create a User in Supabase Studio:**
    -   Navigate to **Authentication** in your Supabase project dashboard.
    -   Click on the **"Users"** tab.
    -   Click **"+ Add User"**.
    -   Enter an email and password for your admin account. Click **"Create User"**.
    -   By default, this user will have their email confirmed (as they are created via the dashboard).

2.  **Update Profile in Database:**
    -   Go to the **Table Editor** in your Supabase project dashboard.
    -   Select the `public.profiles` table.
    -   You should see a row corresponding to the admin user you just created (their `id` will match the `id` from `auth.users`).
    -   Edit this row:
        -   Set the `role` column to `'admin'`.
        -   Set the `account_status` column to `'approved'`.
        -   The `email_verified` column should ideally already be `true` because of the `sync_profile_email_verification` trigger and the user being created via dashboard. If not, you can manually set it to `true` for this initial admin user.

### 3.5. Supabase Auth Settings

1.  In your Supabase project dashboard, go to **Authentication**.
2.  Under **Configuration**, click on **"Settings"**.
3.  Ensure **"Enable Email Confirmations"** is **active (toggled on)**. This is crucial for the sign-up flow.
4.  Review other settings like **"Site URL"** (under "General") and **"Redirect URLs"** (under "Auth Settings"). For local development, the defaults usually work, but for production, ensure "Site URL" points to your deployed application's URL. The application uses `window.location.origin` for email redirect links, which should adapt, but it's good to be aware of these settings.

## 4. Local Project Setup

### 4.1. Clone the Repository

1.  Open your terminal or command prompt.
2.  Clone the project repository:
    ```bash
    git clone <repository_url>
    ```
3.  Navigate into the cloned directory:
    ```bash
    cd <repository_directory>
    ```

### 4.2. Install Dependencies

Install the project dependencies using npm or yarn:

```bash
npm install
# or
yarn install
```

### 4.3. Create Environment File

1.  In the root of your project directory, create a new file named `.env.local`.
2.  Add the following content to this file, replacing the placeholder values with your actual Supabase Project URL and Anon Key (obtained in step 3.2):

    ```env
    VITE_SUPABASE_URL="your_supabase_project_url"
    VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
    ```

    **Example:**
    ```env
    VITE_SUPABASE_URL="https://xyzabcdefghijklmnop.supabase.co"
    VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjQ2NzYwMCwiZXhwIjoxOTMyMDQzNjAwfQ.abcdefghijklmnopqrstuvwxyz1234567890"
    ```
3.  The `.env.local` file is typically included in `.gitignore` by default in Vite projects, ensuring your sensitive credentials are not committed to version control. Double-check this.

### 4.4. Run the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application should now be running. Open your browser and navigate to the local address displayed in your terminal (usually `http://localhost:5173`).

## 5. Key Application Flows (User Perspective)

### 5.1. User Sign-Up

1.  Navigate to the Sign-Up page (e.g., `/signup`).
2.  Fill in all required fields: Full Name, Bar Council Enrollment Number, Phone Number, Email, and Password.
3.  Upon successful submission, you should see a success message prompting you to check your email for verification.

### 5.2. Email Verification

1.  Check your email inbox for a message from Supabase with a verification link.
2.  Click the verification link. This will confirm your email address with Supabase.

### 5.3. Login

1.  Navigate to the Login page (e.g., `/login`).
2.  Enter your registered email and password.
3.  Upon successful login:
    -   If your account is still **'Pending'** or has been **'Declined'** by an admin, the Home page will display your account status. Access to features like the Dashboard (`/dashboard`) will be restricted by the `ProtectedRoute` component.
    -   If your account is **'Approved'**, you will have access to all standard user features.

### 5.4. Admin Approval Process

1.  An **Admin user** (created in step 3.4) logs into the application.
2.  The Admin navigates to the **Admin Panel** (e.g., `/admin`).
3.  The Admin Panel displays a list of users. The admin can filter users by account status.
4.  The Admin can click "Approve" or "Decline" buttons on user cards to change their `account_status`.
    -   If a user's account is approved, an in-app notification will be generated for them.

### 5.5. In-App Notifications (for Account Approval)

1.  When a user's account is approved by an admin:
    -   The next time the user logs in or navigates within the app, the notification bell in the Navbar should show an unread count.
    -   Clicking the bell will display the "Congratulations! Your account has been approved." notification.
    -   Additionally, a dismissible congratulatory message will appear on the Home page.
    -   Clicking the notification or dismissing the banner will mark the specific in-app notification as read.

## 6. Testing

For details on the testing strategy, how to run existing tests, and guidelines for writing new tests, please refer to the `TESTING_STRATEGY.md` file in the project repository.

If test scripts are configured in `package.json` (e.g., under `"scripts": { "test": "vitest" }`), you can typically run them using:

```bash
npm test
# or
yarn test
```

## 7. Backend File Summary (SQL for Supabase)

This is a quick reference to the SQL files used for setting up your Supabase database:

-   **`supabase_migrations.sql`**: Creates the core `public.profiles` table (for user profile data) and the trigger function to synchronize email verification status from `auth.users`.
-   **`supabase_user_notifications_table.sql`**: Defines the schema for the `public.user_notifications` table used for in-app notifications.
-   **`supabase_approval_notification_trigger.sql`**: Creates the database trigger and function that automatically insert an in-app notification into `user_notifications` when a user's profile `account_status` is updated to 'approved'.
-   **`supabase_rls_policies.sql`**: Implements Row Level Security policies for the `profiles` table, primarily allowing users to read and update their own data.
-   **`supabase_admin_rls_policy.sql`**: Implements an RLS policy for the `profiles` table that grants administrators full access to manage all profiles.
-   **`supabase_user_notifications_rls.sql`**: Implements RLS policies for the `user_notifications` table, allowing users to read their own notifications and mark them as read, and granting administrators full access.
-   **`supabase_example_data_rls_policies.sql`**: Contains example RLS policies that can be used as a template for securing future data tables that store user-specific information.

---

This guide should help you get the Advocate AI platform up and running. If you encounter any issues, please review the steps or consult the project's README if available.
