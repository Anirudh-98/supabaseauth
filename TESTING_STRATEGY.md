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

*(These tests generally involve mocking the `useAuth` hook's return values from the `AuthProvider` context, not `useAuthStore`)*

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
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false`, `isVerified: true`, `isApproved: false` (and `user.account_status` from context is 'declined'). The "declined" UI is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.5:** Authenticated, verified, approved 'User' can access standard protected routes (e.g., `/dashboard`).
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false`, `isVerified: true`, `isApproved: true`, `isAdmin: false`. The protected child component is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.6:** Authenticated, verified, approved 'User' attempting to access an admin-only route (e.g., `/admin`) is redirected to `/home` (or a generic "access denied" page).
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false`, `isVerified: true`, `isApproved: true`, `isAdmin: false`. User is navigated to `/home`.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.7:** Authenticated, verified, approved 'Admin' user can access admin-only routes (e.g., `/admin`).
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false`, `isVerified: true`, `isApproved: true`, `isAdmin: true`. The admin protected child component is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 3.8:** `ProtectedRoute` shows `LoadingScreen` when `loading` is true.
    -   **Verification:** `useAuth` returns `loading: true`. The `LoadingScreen` component is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

### d. `AuthRequiredRoute` Component & Routing

-   **Test Case 4.1:** Unauthenticated user attempting to access a route wrapped by `AuthRequiredRoute` (e.g., `/home`) is redirected to `/login`.
    -   **Verification:** `useAuth` returns `session: null`, `loading: false`. User is navigated to `/login`.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 4.2:** Authenticated user (regardless of `isVerified` or `isApproved` status) can access routes wrapped by `AuthRequiredRoute`.
    -   **Verification:** `useAuth` returns `session: {}`, `loading: false` (and any combination of `isVerified`/`isApproved`). The protected child component is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.

-   **Test Case 4.3:** `AuthRequiredRoute` shows `LoadingScreen` when `loading` is true.
    -   **Verification:** `useAuth` returns `loading: true`. The `LoadingScreen` component is rendered.
    -   **Method:** Unit/Integration test with RTL and `MemoryRouter`.


### e. Admin Panel - User Management (`UserList.tsx`)

*(Requires mocking Supabase client calls and `useAuthStore` to simulate an admin user being logged in)*

-   **Test Case 5.1:** Admin can view a list of users fetched from the `profiles` table.
    -   **Verification:** `supabase.from('profiles').select` is called. The returned user data is rendered in the table.
    -   **Method:** Integration test with RTL, mocking Supabase.

-   **Test Case 5.2:** Filtering by `account_status` ('Pending', 'Approved', 'Declined', 'All') correctly updates the displayed user list.
    -   **Verification:** Clicking filter buttons updates the list to show only users matching that status (or all users).
    -   **Method:** Integration test with RTL, mocking Supabase initially, then testing client-side filtering logic.

-   **Test Case 5.3:** Clicking "Approve" on a 'Pending' user:
    -   **Verification:** `supabase.from('profiles').update({ account_status: 'approved' })` is called for the correct user ID. The UI reflects the change (e.g., status text, available buttons). The Edge Function `send-status-email` is conceptually triggered (not directly tested in this UI test, but its invocation is part of the action).
    -   **Method:** Integration test with RTL, mocking Supabase.

-   **Test Case 5.4:** Clicking "Decline" on a 'Pending' user:
    -   **Verification:** `supabase.from('profiles').update({ account_status: 'declined' })` is called. UI reflects the change. Edge Function `send-status-email` is conceptually triggered.
    -   **Method:** Integration test with RTL, mocking Supabase.

-   **Test Case 5.5:** Clicking "Decline" on an 'Approved' user:
    -   **Verification:** `supabase.from('profiles').update({ account_status: 'declined' })` is called. UI reflects the change. Edge Function `send-status-email` is conceptually triggered.
    -   **Method:** Integration test with RTL, mocking Supabase.

-   **Test Case 5.6:** Clicking "Approve" on a 'Declined' user:
    -   **Verification:** `supabase.from('profiles').update({ account_status: 'approved' })` is called. UI reflects the change. Edge Function `send-status-email` is conceptually triggered.
    -   **Method:** Integration test with RTL, mocking Supabase.

-   **Test Case 5.7:** Action buttons are not shown for admin users in the list.
    -   **Verification:** Rows corresponding to users with `role: 'admin'` do not have action buttons.
    -   **Method:** Integration test with RTL.

### f. User Dashboard/Home Page (`Home.tsx`)

-   **Test Case 6.1:** Logged-in, approved user sees their correct `advocate_full_name` and `account_status` displayed.
    -   **Verification:** `useAuthStore` provides user data. The correct name and status (e.g., "Account Status: Approved") are rendered.
    -   **Method:** Unit/Integration test with RTL, mocking `useAuthStore`.

-   **Test Case 6.2:** User with 'Pending' status sees "Account Status: Pending" with appropriate styling.
    -   **Verification:** `useAuthStore` provides user data with `account_status: 'pending'`. Correct text and styling are applied.
    -   **Method:** Unit/Integration test with RTL, mocking `useAuthStore`.

-   **Test Case 6.3:** User with 'Declined' status sees "Account Status: Declined" with appropriate styling.
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
// const MockVerifyPage = () => <div data-testid="verify-page">Verify Email Page</div>; // Example if you had specific pages
// const MockPendingPage = () => <div data-testid="pending-page">Pending Approval Page</div>; // Example

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
      user: null, 
      // Mock any other properties/methods from AuthProviderContextType your component might use
      // For example, if your ProtectedRoute or its children somehow call login/logout from context:
      login: vi.fn().mockResolvedValue({ error: null }),
      logout: vi.fn().mockResolvedValue(undefined),
      // ... any other methods expected by the context type
    } as AuthProviderContextType); // Cast to ensure all properties are covered or explicitly set

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
      user: { id: 'test-user', email: 'test@example.com', account_status: 'pending', role: 'User' } as any, // Mock Profile
      login: vi.fn().mockResolvedValue({ error: null }),
      logout: vi.fn().mockResolvedValue(undefined),
    } as AuthProviderContextType);

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

## 5. Testing In-App Notification Features

This section outlines test scenarios for the in-app notification system, including backend trigger functionality, the Zustand notification store, and UI components.

### a. Backend Notification Creation (Trigger-Based)

-   **Test Case N1.1:** Account approval triggers in-app notification.
    -   **Scenario:** A user's `account_status` in the `profiles` table is updated from any non-'approved' status (e.g., 'pending') to 'approved'.
    -   **Verification:**
        1.  A new notification record is inserted into the `user_notifications` table.
        2.  The new record has the correct `user_id` (matching the updated profile).
        3.  The `type` is `'account_approved'`.
        4.  The `message` is correctly formatted (e.g., "Congratulations, [User's Name]! Your account has been approved.").
        5.  The `link_to` field is `'/dashboard'`.
        6.  `is_read` is `false`.
    -   **Method:** This is an integration test best performed directly against a test Supabase instance.
        1.  **Setup:** Ensure a test user exists with a non-'approved' status.
        2.  **Action:** Update the test user's `account_status` to 'approved' (e.g., via Supabase Studio, a client script, or an admin UI action if available).
        3.  **Verification:** Query the `user_notifications` table for the specific `user_id` and verify the newly created notification's properties.
        4.  **Cleanup:** Optionally, delete the created notification and revert the user's status.
    -   **Note:** While pgTAP could be used for more automated database testing, manual/query-based verification is sufficient for this scenario initially.

### b. Notification Store (`notificationStore.ts` - Unit/Integration Tests)

*(Mock Supabase client for these tests)*

-   **Test Case N2.1:** `fetchNotifications()` action.
    -   **Scenario:** Action is called for a logged-in user.
    -   **Mock:** `supabase.from('user_notifications').select().eq().order().limit()` to return a mock list of notifications.
    -   **Verification:**
        -   `isLoading` state is `true` during the fetch, then `false`.
        -   `notifications` array in the store is populated with the mocked data.
        -   `unreadCount` is correctly calculated based on `is_read: false` in mocked data.
        -   `hasFetchedInitialNotifications` is set to `true`.
    -   **Method:** Vitest unit test, mocking `supabase`.

-   **Test Case N2.2:** `fetchNotifications()` when no user is provided.
    -   **Scenario:** Action is called with `currentUser: null`.
    -   **Verification:**
        -   No Supabase call is made.
        -   `isLoading` remains `false` or is set to `false`.
        -   `hasFetchedInitialNotifications` is set to `true` (to prevent refetch loops).
        -   `notifications` and `unreadCount` remain in their initial state (e.g., empty/zero).
    -   **Method:** Vitest unit test.

-   **Test Case N2.3:** `markAsRead(notificationId)` action.
    -   **Scenario:** Action is called with a valid `notificationId` for an unread notification.
    -   **Mock:** `supabase.from('user_notifications').update()` to return success.
    -   **Initial State:** Populate store with a list of notifications, including one unread target notification.
    -   **Verification:**
        -   Optimistic UI: The target notification's `is_read` becomes `true` immediately in the store. `unreadCount` decrements.
        -   Backend call: `supabase.from('user_notifications').update({ is_read: true }).eq('id', notificationId).eq('user_id', currentUserId)` is called.
    -   **Method:** Vitest unit test, mocking `supabase`.

-   **Test Case N2.4:** `markAsRead(notificationId)` action with backend error.
    -   **Scenario:** Backend update call fails.
    -   **Mock:** `supabase.from('user_notifications').update()` to return an error.
    -   **Verification:**
        -   Optimistic UI update is reverted. The notification's `is_read` status and `unreadCount` return to their original values.
    -   **Method:** Vitest unit test, mocking `supabase`.

-   **Test Case N2.5:** `markAllAsRead()` action.
    -   **Scenario:** User has multiple unread notifications.
    -   **Mock:** `supabase.from('user_notifications').update()` to return success.
    -   **Initial State:** Populate store with multiple unread notifications.
    -   **Verification:**
        -   Optimistic UI: All unread notifications in the store become `is_read: true`. `unreadCount` becomes `0`.
        -   Backend call: `supabase.from('user_notifications').update({ is_read: true }).eq('user_id', currentUserId).eq('is_read', false)` is called.
    -   **Method:** Vitest unit test, mocking `supabase`.

-   **Test Case N2.6:** `markAllAsRead()` action with backend error.
    -   **Scenario:** Backend update call fails.
    -   **Mock:** `supabase.from('user_notifications').update()` to return an error.
    -   **Verification:** Optimistic UI update is reverted. Notifications' `is_read` status and `unreadCount` return to their original values.
    -   **Method:** Vitest unit test, mocking `supabase`.

-   **Test Case N2.7:** `getUnreadApprovalNotification()` selector.
    -   **Scenario 1:** Store contains an unread 'account_approved' notification.
        -   **Verification:** The function returns the correct notification object.
    -   **Scenario 2:** Store contains an 'account_approved' notification that is already read.
        -   **Verification:** The function returns `null`.
    -   **Scenario 3:** Store does not contain any 'account_approved' notifications.
        -   **Verification:** The function returns `null`.
    -   **Scenario 4:** Notifications have not been fetched yet (`hasFetchedInitialNotifications: false`).
        -   **Verification:** The function returns `null` (and logs a warning).
    -   **Method:** Vitest unit test (no Supabase mocking needed, tests store logic).

-   **Test Case N2.8:** `subscribeToNewNotifications()` action.
    -   **Scenario:** Subscription is active, and a new notification payload is received.
    -   **Mock:** `supabase.channel().on().subscribe()` and simulate a new `INSERT` payload.
    -   **Verification:**
        -   The new notification is added to the `notifications` array in the store (typically prepended).
        -   `unreadCount` is incremented.
        -   The list of notifications does not grow indefinitely beyond a reasonable limit if such logic is implemented.
    -   **Method:** Vitest unit test, mocking Supabase real-time.

-   **Test Case N2.9:** `resetNotificationState()` action.
    -   **Scenario:** Action is called (e.g., on user logout).
    -   **Initial State:** Populate store with some notifications and an unread count.
    -   **Verification:** `notifications` becomes `[]`, `unreadCount` becomes `0`, `isLoading` becomes `false`, `hasFetchedInitialNotifications` becomes `false`.
    -   **Method:** Vitest unit test.

### c. Navbar UI (`Navbar.tsx` - Component/Integration Tests with RTL)

*(Mock `useNotificationStore` and `useAuthStore` for these tests)*

-   **Test Case N3.1:** Notification bell displays correct unread count.
    -   **Mock:** `useNotificationStore` returns `unreadCount: 5`.
    -   **Verification:** The badge on the Bell icon displays "5". If `unreadCount` is 0, no badge is shown or badge is hidden.
    -   **Method:** RTL component test.

-   **Test Case N3.2:** Clicking Bell icon toggles notification dropdown.
    -   **Mock:** `useNotificationStore` returns some initial state.
    -   **Verification:**
        -   Initially, dropdown is not visible.
        -   After clicking Bell icon, dropdown becomes visible.
        -   Clicking again hides the dropdown.
        -   Clicking outside the dropdown (if implemented) hides it.
    -   **Method:** RTL component test, checking for presence/absence of dropdown content.

-   **Test Case N3.3:** Dropdown lists notifications correctly.
    -   **Mock:** `useNotificationStore` returns `notifications: [...]` with a mix of read and unread notifications.
    -   **Verification:**
        -   Each notification's message and formatted timestamp are rendered.
        -   Unread notifications have distinct styling (e.g., background color, bold text).
        -   Loading state is shown if `isLoadingNotifications: true` and `notifications` is empty.
        -   "No notifications yet" message is shown if `!isLoadingNotifications` and `notifications` is empty.
    -   **Method:** RTL component test.

-   **Test Case N3.4:** "Mark all as read" button functionality.
    -   **Mock:** `useNotificationStore` returns `unreadCount > 0` and a mock `markAllAsRead` function.
    -   **Verification:**
        -   Button is visible if `unreadCount > 0`.
        -   Clicking the button calls the mocked `markAllAsRead` function from the store.
    -   **Method:** RTL component test.

-   **Test Case N3.5:** Clicking an individual unread notification.
    -   **Mock:** `useNotificationStore` returns an unread notification and a mock `markAsRead` function. `useNavigate` is mocked.
    -   **Verification:**
        -   Clicking the notification item calls the mocked `markAsRead` function with the correct notification ID.
        -   If the notification has a `link_to` property, `navigate(link_to)` is called.
        -   Dropdown closes after interaction.
    -   **Method:** RTL component test.

-   **Test Case N3.6:** Clicking an individual read notification.
    -   **Mock:** `useNotificationStore` returns a read notification and mock `markAsRead`, `useNavigate`.
    -   **Verification:**
        -   `markAsRead` is NOT called.
        -   If `link_to` exists, `navigate(link_to)` is called.
        -   Dropdown closes.
    -   **Method:** RTL component test.

### d. Homepage Approval Message (`Home.tsx` - Component/Integration Tests with RTL)

*(Mock `useNotificationStore` and `useAuthStore` for these tests)*

-   **Test Case N4.1:** Approval message displays correctly.
    -   **Mock:** `useAuthStore` returns `user` with `account_status: 'approved'`. `useNotificationStore`'s `getUnreadApprovalNotification` returns a mock 'account_approved' notification object.
    -   **Verification:** The congratulatory "Your account has been approved" message banner is visible and contains the user's name.
    -   **Method:** RTL component test.

-   **Test Case N4.2:** Approval message does not display if user not approved.
    -   **Mock:** `useAuthStore` returns `user` with `account_status: 'pending'`. `getUnreadApprovalNotification` may or may not return a notification.
    -   **Verification:** The approval message banner is not visible.
    -   **Method:** RTL component test.

-   **Test Case N4.3:** Approval message does not display if no unread approval notification exists.
    -   **Mock:** `useAuthStore` returns `user` with `account_status: 'approved'`. `getUnreadApprovalNotification` returns `null`.
    -   **Verification:** The approval message banner is not visible.
    -   **Method:** RTL component test.

-   **Test Case N4.4:** Dismissing the approval message.
    -   **Mock:** Setup as in N4.1. `useNotificationStore`'s `markSpecificNotificationAsRead` is mocked.
    -   **Verification:**
        -   Clicking the dismiss ("X") button on the banner hides the banner.
        -   The mocked `markSpecificNotificationAsRead` function is called with the correct notification ID.
    -   **Method:** RTL component test.
