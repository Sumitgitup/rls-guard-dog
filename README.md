# RLS Guard Dog: A Multi-Tenant School Management App

![Project Status](https://img.shields.io/badge/status-complete-green)

This is a full-stack application built with Next.js and Supabase that demonstrates a robust, multi-level security model using Supabase's Row-Level Security (RLS) and Authentication.

## Project Goal

The primary goal was to create a secure, multi-tenant system for a school environment. The application needed to enforce strict data access rules: students can only see their own records, teachers can only see records for their assigned class, and a head teacher has read-only access to all records in the school. The project also includes a serverless function for data processing and integration with MongoDB.

## Tech Stack

* **Framework**: Next.js (with App Router)
* **Backend & Auth**: Supabase (PostgreSQL, Auth, RLS, Edge Functions)
* **Database**: PostgreSQL (via Supabase), MongoDB (for analytics)
* **Styling**: Tailwind CSS
* **Language**: TypeScript

## Features

* **Secure, Role-Based Authentication**: Users sign up and are assigned one of three roles: `student`, `teacher`, or `head_teacher`.
* **Role-Based Redirects**: After logging in, users are automatically redirected to their appropriate dashboard.
* **Row-Level Security**: Data access is controlled at the database level, ensuring:
    * **Students** can only view their own progress reports.
    * **Teachers** can view and edit progress for all students in their specific class.
    * **Head Teachers** can view a complete roster of all teachers and students in the school.
* **Protected Routes**: The application uses middleware to protect role-specific dashboards (e.g., `/teacher`, `/student`).
* **Serverless Function**: A Supabase Edge Function allows a teacher to calculate their class average, which is then stored in a separate MongoDB database.

## Project Setup and Installation

### Prerequisites

* Node.js (v18 or later)
* A Supabase account
* A MongoDB Atlas account
* [Supabase CLI](https://supabase.com/docs/guides/cli) installed

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd rls-guard-dog
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1.  Create a new project on [Supabase](https://supabase.com).
2.  Link your local project to your Supabase project:
    ```bash
    supabase login
    supabase link --project-ref YOUR_PROJECT_ID
    ```
    (You can find your `PROJECT_ID` in your Supabase project's URL).

### 4. Configure Environment Variables

Create a `.env.local` file in the root of the project. Copy the contents of your existing `.env.local` file.

```
# .env.local

# Supabase URL and Anon Key from your Supabase Project's API settings
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-project-anon-key>

# MongoDB Connection String (for the Edge Function)
MONGO_URI=<your-mongodb-connection-string>
```

### 5. Set Up the Database and Seed Data

This single script will clean, create, and populate your database with test data and the necessary security policies.

1.  **Create Test Users**: In your running Next.js app, sign up with three emails: `student@test.com`, `teacher@test.com`, and `head-teacher@test.com`. **Turn off "Confirm email"** in your Supabase Auth settings for easy testing.
2.  **Get User UUIDs**: Go to the **Authentication** section of your Supabase dashboard and copy the UUID for each user.
3.  **Run the SQL Script**: Go to the **SQL Editor** in your Supabase dashboard, paste the entire script below (after replacing the placeholder UUIDs), and click **RUN**.

<details>
<summary>Click to expand the One-Step SQL Seeding Script</summary>

```sql
-- STEP 1: CLEAN UP
DROP TABLE IF EXISTS public.progress;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.classrooms;
DROP TABLE IF EXISTS public.schools;
DROP TYPE IF EXISTS public.user_role;

-- STEP 2: CREATE TABLES & RLS POLICIES
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'head_teacher');

CREATE TABLE public.schools (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL);
CREATE TABLE public.classrooms (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE);
CREATE TABLE public.profiles (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name TEXT, role user_role NOT NULL, school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE, classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL);
CREATE TABLE public.progress (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE, school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE, subject TEXT NOT NULL, score INT NOT NULL CHECK (score >= 0 AND score <= 100), updated_at TIMESTAMPTZ DEFAULT now());

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Head teachers can view all school profiles" ON public.profiles FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'head_teacher');
CREATE POLICY "Students can view their own progress" ON public.progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers can manage progress in their class" ON public.progress FOR ALL USING (classroom_id = (SELECT classroom_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Head teachers can view all school progress" ON public.progress FOR SELECT USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

-- STEP 3: INSERT DATA
BEGIN;
INSERT INTO public.schools (name) VALUES ('Supabase Academy');
INSERT INTO public.classrooms (name, school_id) VALUES ('Class A - Algebra', (SELECT id FROM public.schools WHERE name = 'Supabase Academy')), ('Class B - Biology', (SELECT id FROM public.schools WHERE name = 'Supabase Academy'));

-- ❗️ REPLACE THE UUIDs BELOW ❗️
INSERT INTO public.profiles (id, full_name, role, school_id, classroom_id) VALUES
  ('PASTE_YOUR_HEAD_TEACHER_UUID_HERE', 'Dr. Evelyn Reed', 'head_teacher', (SELECT id FROM public.schools WHERE name = 'Supabase Academy'), NULL),
  ('PASTE_YOUR_TEACHER_UUID_HERE', 'Mr. David Chen', 'teacher', (SELECT id FROM public.schools WHERE name = 'Supabase Academy'), (SELECT id FROM public.classrooms WHERE name = 'Class A - Algebra')),
  ('PASTE_YOUR_STUDENT_UUID_HERE', 'Alice', 'student', (SELECT id FROM public.schools WHERE name = 'Supabase Academy'), (SELECT id FROM public.classrooms WHERE name = 'Class A - Algebra'));

INSERT INTO public.progress (student_id, classroom_id, school_id, subject, score) VALUES
  ('PASTE_YOUR_STUDENT_UUID_HERE', (SELECT id FROM public.classrooms WHERE name = 'Class A - Algebra'), (SELECT id FROM public.schools WHERE name = 'Supabase Academy'), 'Linear Equations', 92),
  ('PASTE_YOUR_STUDENT_UUID_HERE', (SELECT id FROM public.classrooms WHERE name = 'Class A - Algebra'), (SELECT id FROM public.schools WHERE name = 'Supabase Academy'), 'Polynomials', 88);
COMMIT;
```
</details>

### 6. Set Up the Edge Function

1.  **Set the MongoDB Secret**: In your terminal, run the following command to securely store your MongoDB connection string.
    ```bash
    supabase secrets set MONGO_URI="<your-mongodb-connection-string>"
    ```
2.  **Deploy the Function**:
    ```bash
    supabase functions deploy class-average --no-verify-jwt
    ```

### 7. Run the Application

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## How to Test the Application

Use the following credentials to log in and observe the RLS policies in action.

* **Student**:
    * **Email**: `student@test.com`
    * **Action**: Log in.
    * **Expected Result**: You will be redirected to the `/student` page and will see the two progress records for "Alice".

* **Teacher**:
    * **Email**: `teacher@test.com`
    * **Action**: Log in.
    * **Expected Result**: You will be redirected to the `/teacher` page. You will see the two progress records for "Alice" because she is in your assigned class. You can edit her scores and calculate the class average.

* **Head Teacher**:
    * **Email**: `head-teacher@test.com`
    * **Action**: Log in.
    * **Expected Result**: You will be redirected to the `/head-teacher` page. You will see a roster of all users in the school ("Dr. Evelyn Reed", "Mr. David Chen", "Alice").