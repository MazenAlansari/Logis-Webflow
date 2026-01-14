Gaps / Risks vs. common best practices
1) Session store is in-memory
memorystore is used, which is not ideal for production (volatile, single‑process, no horizontal scalability). A production‑grade store (Redis, etc.) is recommended.

2) Response logging can leak secrets
The request logger captures full JSON responses for /api routes. This can log temporary passwords from:

POST /api/admin/users (returns tempPassword)

POST /api/admin/users/:id/reset-password (returns tempPassword)

This is a sensitive exposure risk if logs are retained or aggregated.

3) Default seeded admin credentials
The seed uses ADMIN_PASSWORD default "admin123" if not provided, and the seeded admin is not forced to change password (mustChangePassword: false). This is risky if env vars are misconfigured in production.

4) Password strength enforcement is missing
changePassword accepts any newPassword without validation (length/complexity), which can allow weak passwords.

The PM doc indicates minimum length requirements, but code does not enforce it in change password.

5) Error responses may leak internal messages
The global error handler returns err.message directly for all errors, including 500s. This can expose internal error details to clients in production.

6) CSRF protection relies only on SameSite
sameSite: "lax" is good, but there’s no CSRF token strategy. If you ever need cross‑site requests or embed forms, you may need explicit CSRF protection (e.g., csurf).

✅ Recommendations (prioritized)
Use a production session store (Redis or database-backed) instead of MemoryStore to prevent session loss and improve security/scale.

Avoid logging sensitive responses

Remove or redact tempPassword fields in request logging to avoid leaking credentials in logs.

Harden seeded admin

Require ADMIN_PASSWORD in production or force mustChangePassword: true for seeded admin accounts.

Add password validation on change

Enforce minimum length (e.g., 8+) and complexity before hashing new passwords.

Return generic error messages for 500s

Preserve detailed errors in logs, but respond with a generic message in production to avoid leakage.

