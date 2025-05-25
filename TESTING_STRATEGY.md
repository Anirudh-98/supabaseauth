# Testing Strategy for Authentication and Authorization

This document outlines the testing strategy for the key authentication and authorization features of this application.

## 1. Recommended Testing Tools

-   **Unit/Integration Testing:**
    -   **Vitest:** A fast, Vite-native test runner. It offers a Jest-compatible API and first-class TypeScript support.
    -   **React Testing Library (RTL):** For testing React components in a way that simulates user interactions and focuses on accessibility.
    -   **Why:** Vitest integrates seamlessly with Vite projects, providing speed and a good developer experience. RTL encourages writing tests that resemble how users interact with the application, leading to more robust and maintainable tests.

-   **End-to-End (E2E) Testing:**
    -   **Playwright:** A modern E2E testing framework developed by Microsoft. It supports multiple browsers, is known for its speed and reliability, and has excellent auto-wait capabilities.
    -   **Cypress:** Another popular E2E testing framework. It's known for its interactive test runner and ease of debugging.
    -   **Why:** E2E tests are crucial for verifying complete application flows from the user's perspective. Both Playwright and Cypress are strong choices. Playwright might be preferred for its broader browser support and potentially faster execution in some scenarios.

-   **Mocking:**
    -   **Vitest's `vi.mock`:** For mocking modules and functions (e.g., Supabase client, custom hooks).
    -   **Mock Service Worker (MSW):** Can be used for intercepting and mocking HTTP requests at the network level, providing more realistic API interaction tests without hitting the actual backend. This is particularly useful for integration and E2E tests.

## 2. Key Test Scenarios to Cover

### a. Sign-Up Flow (`SignupForm.tsx`, `authStore.ts`)

-   **Test Case 1.1:** User can successfully fill and submit the sign-up form with valid data.
    -   **Verification:**
        -   `supabase.auth.signUp` is called with the correct email, password, and user metadata.
        -   `supabase.from('profiles').insert` is called with the correct user ID, email, full name, bar council number, phone number, `role: 'User'`, and `account_status: 'Pending'`.
        -   Success message is displayed to the user.
        -   Navigation to email verification/pending approval page occurs (if applicable).
    -   **Method:** Unit/Integration test with RTL, mocking Supabase client calls.

-   **Test Case 1.2:** Submission fails if required fields are missing.
    -   **Verification:** Error messages are displayed for each missing required field. No Supabase calls are made.
    -   **Method:** Unit test with RTL.

-   **Test Case 1.3:** Submission fails if the password is too short.
    -   **Verification:** Error message regarding password length is displayed. No Supabase calls are made.
    -   **Method:** Unit test with RTL.

-   **Test Case 1.4:** Submission fails if Supabase `auth.signUp` returns an error.
    -   **Verification:** Error message from Supabase is displayed.
    -   **Method:** Unit/Integration test with RTL, mocking `supabase.auth.signUp` to return an error.

-   **Test Case 1.5:** Submission fails if `profiles` table insert returns an error.
    -   **Verification:** Error message is displayed.
    -   **Method:** Unit/Integration test with RTL, mocking `supabase.from('profiles').insert` to return an error.

### b. Login Flow (`LoginForm.tsx`, `authStore.ts`)

-   **Test Case 2.1:** User can successfully log in with valid credentials.
    -   **Verification:**
        -   `supabase.auth.signInWithPassword` is called with correct email and password.
        -   User session is established in `authStore`.
        -   Profile data is fetched and loaded into `authStore` (`user`, `isAdmin`, `isVerified`, `isApproved`).
        -   Navigation to the home page or intended protected route.
    -   **Method:** Unit/Integration test with RTL, mocking Supabase client calls.

-   **Test Case 2.2:** Login fails with invalid credentials.
    -   **Verification:** Error message is displayed. No session is established.
    -   **Method:** Unit/Integration test with RTL, mocking `supabase.auth.signInWithPassword` to return an error.

-   **Test Case 2.3:** Login fails if profile data cannot be fetched.
    -   **Verification:** Error message is displayed, or user is logged out. Session might be cleared.
    -   **Method:** Unit/Integration test with RTL, mocking `supabase.from('profiles').select` to return an error after successful `signInWithPassword`.

### c. `ProtectedRoute` Component & Routing

*(These tests generally involve mocking the `useAuth` hook's return values)*

-   **Test Case 3.1:** Unauthenticated user attempting to access a protected route is redirected to `/login`.
    -   **Verification:** `useAuth` returns `session: null`, `loading: false`. User is navigated to `/login`.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.2:** Authenticated user with `isVerified=false` is shown the "verify email" message when accessing a protected route.
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false`, `isVerified: false`. The "verify email" UI is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.3:** Authenticated, verified user with `isApproved=false` (status 'pending') is shown the "account pending approval" message.
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false`, `isVerified: true`, `isApproved: false`. The "pending approval" UI is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.4:** Authenticated, verified user with `isApproved=false` (status 'declined') is shown an appropriate "account declined" message (if UI differentiates this from 'pending').
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false`, `isVerified: true`, `isApproved: false` (and `user.account_status` is 'declined'). The "declined" UI is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.5:** Authenticated, verified, approved 'User' can access standard protected routes (e.g., `/home`).
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false`, `isVerified: true`, `isApproved: true`, `isAdmin: false`. The protected child component is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.6:** Authenticated, verified, approved 'User' attempting to access an admin-only route (e.g., `/admin`) is redirected to `/home`.
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false`, `isVerified: true`, `isApproved: true`, `isAdmin: false`. User is navigated to `/home`.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.7:** Authenticated, verified, approved 'Admin' user can access admin-only routes (e.g., `/admin`).
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false`, `isVerified: true`, `isApproved: true`, `isAdmin: true`. The admin protected child component is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.8:** `ProtectedRoute` shows `LoadingScreen` when `loading` is true.
    -   **Verification:** `useAuth` returns `loading: true`. The `LoadingScreen` component is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

### d. Admin Panel - User Management (`UserList.tsx`)

*(Requires mocking Supabase client calls, assuming an admin user is logged in)*

-   **Test Case 4.1:** Admin can view a list of users fetched from the `profiles` table.
    -   **Verification:** `supabase.from('profiles').select` is called. The returned user data is rendered in the table.
    -   **Method:** Integration test with RTL, mocking Supabase.

-   **Test Case 4.2:** Filtering by `account_status` ('Pending', 'Approved', 'Declined', 'All') correctly updates the displayed user list.
    -   **Verification:** Clicking filter buttons updates the list to show only users matching that status (or all users).
    -   **Method:** Integration test with RTL, mocking Supabase initially, then testing client-side filtering logic.

-   **Test Case 4.3:** Clicking "Approve" on a 'Pending' user:
    -   **Verification:** `supabase.from('profiles').update({ account_status: 'approved' })` is called for the correct user ID. The UI reflects the change (e.g., status text, available buttons).
    -   **Method:** Integration test with RTL, mocking Supabase.

-   **Test Case 4.4:** Clicking "Decline" on a 'Pending' user:
    -   **Verification:** `supabase.from('profiles').update({ account_status: 'declined' })` is called. UI reflects the change.
    -   **Method:** Integration test with RTL, mocking Supabase.

-   **Test Case 4.5:** Clicking "Decline" on an 'Approved' user:
    -   **Verification:** `supabase.from('profiles').update({ account_status: 'declined' })` is called. UI reflects the change.
    -   **Method:** Integration test with RTL, mocking Supabase.

-   **Test Case 4.6:** Clicking "Approve" on a 'Declined' user:
    -   **Verification:** `supabase.from('profiles').update({ account_status: 'approved' })` is called. UI reflects the change.
    -   **Method:** Integration test with RTL, mocking Supabase.

-   **Test Case 4.7:** Action buttons are not shown for admin users in the list.
    -   **Verification:** Rows corresponding to users with `role: 'admin'` do not have action buttons.
    -   **Method:** Integration test with RTL.

### e. User Dashboard/Home Page (`Home.tsx`)

-   **Test Case 5.1:** Logged-in, approved user sees their correct `advocate_full_name` and `account_status` displayed.
    -   **Verification:** `useAuthStore` provides user data. The correct name and status (e.g., "Account Status: Approved") are rendered.
    -   **Method:** Unit/Integration test with RTL, mocking `useAuthStore`.

-   **Test Case 5.2:** User with 'Pending' status sees "Account Status: Pending" with appropriate styling.
    -   **Verification:** `useAuthStore` provides user data with `account_status: 'pending'`. Correct text and styling are applied.
    -   **Method:** Unit/Integration test with RTL, mocking `useAuthStore`.

-   **Test Case 5.3:** User with 'Declined' status sees "Account Status: Declined" with appropriate styling.
    -   **Verification:** `useAuthStore` provides user data with `account_status: 'declined'`. Correct text and styling are applied.
    -   **Method:** Unit/Integration test with RTL, mocking `useAuthStore`.

## 3. Conceptual Test Example (Vitest + React Testing Library)

This conceptual example demonstrates testing one scenario for `ProtectedRoute`.

```typescript
// __tests__/ProtectedRoute.test.tsx (Conceptual Example)
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest'; // Vitest's global object for mocking

// Assuming ProtectedRoute is a named export
import { ProtectedRoute } from '../src/components/auth/ProtectedRoute'; 
// Assuming useAuth is exported from AuthProvider and its type
import { useAuth, AuthProviderContextType } from '../src/components/auth/AuthProvider'; 

// Mock the useAuth hook
vi.mock('../src/components/auth/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('../src/components/auth/AuthProvider');
  return {
    ...actual, // Preserve other exports from the module
    useAuth: vi.fn(), // Mock useAuth specifically
  };
});

const MockChildComponent = () => <div data-testid="protected-content">Protected Content</div>;
const MockLoginPage = () => <div data-testid="login-page">Login Page</div>;
const MockVerifyPage = () => <div data-testid="verify-page">Verify Email Page</div>;
const MockPendingPage = () => <div data-testid="pending-page">Pending Approval Page</div>;
const MockHomePage = () => <div data-testid="home-page">Home Page</div>;


describe('ProtectedRoute', () => {
  // Cast the mocked useAuth to the correct type for TypeScript
  const mockUseAuth = useAuth as vi.Mock<[], AuthProviderContextType>;

  afterEach(() => {
    vi.clearAllMocks(); // Clear mocks after each test
  });

  it('redirects unauthenticated users to login', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: false,
      isApproved: false,
      isAdmin: false,
      isVerified: false,
      user: null, // Add other fields from AuthProviderContextType as needed
      login: vi.fn(),
      logout: vi.fn(),
      // ... other methods
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<MockLoginPage />} />
          <Route 
            path="/protected" 
            element={<ProtectedRoute><MockChildComponent /></ProtectedRoute>} 
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows verify email message if user is not verified', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'test-user' } } as any, // Mock session object
      loading: false,
      isApproved: false,
      isAdmin: false,
      isVerified: false,
      user: { id: 'test-user', email: 'test@example.com', account_status: 'pending', role: 'User' } as any,
      // ... other fields and methods
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<MockLoginPage />} />
          <Route 
            path="/protected" 
            element={<ProtectedRoute><MockChildComponent /></ProtectedRoute>} 
          />
        </Routes>
      </MemoryRouter>
    );
    // Check for text content as per ProtectedRoute's implementation
    expect(screen.getByText(/Email Verification Required/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
  
  // Add more tests for other scenarios:
  // - User is verified but not approved (pending)
  // - User is verified but not approved (declined)
  // - User is verified, approved, and a regular user accessing a user route
  // - User is verified, approved, and a regular user accessing an admin route (redirect)
  // - User is verified, approved, and an admin accessing an admin route
  // - Loading state
});
```

## 4. Setting up the Testing Environment

1.  **Install Dependencies:**
    ```bash
    npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom happy-dom
    # or
    yarn add --dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom happy-dom
    ```
    (`@testing-library/jest-dom` for additional matchers like `toBeInTheDocument`, `jsdom` or `happy-dom` for the test environment).

2.  **Configure Vitest:**
    Create or update `vite.config.ts` (or `vitest.config.ts`):
    ```typescript
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      test: {
        globals: true,
        environment: 'jsdom', // or 'happy-dom'
        setupFiles: './src/setupTests.ts', // Optional setup file
        css: true, // If you need to process CSS
      },
    });
    ```

3.  **Setup File (Optional - `src/setupTests.ts`):**
    ```typescript
    // src/setupTests.ts
    import '@testing-library/jest-dom';
    // Any other global setup for tests
    ```

4.  **Add Test Scripts to `package.json`:**
    ```json
    "scripts": {
      // ... other scripts
      "test": "vitest",
      "test:ui": "vitest --ui", // For Vitest UI
      "coverage": "vitest run --coverage"
    },
    ```

This structured approach should provide a solid foundation for testing the application's authentication and authorization logic. Developers will need to write the actual test implementations based on these guidelines.
