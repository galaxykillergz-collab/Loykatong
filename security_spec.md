# Security Specification: Loy Krathong Online

## 1. Data Invariants (`/krathongs/{krathongId}` & `/admins/{adminId}`)
1. Every document ID must match `^[a-zA-Z0-9_-]+$` and be <= 128 characters.
2. Every krathong document must include a valid `boardId` (`3..64` chars matching `^[a-zA-Z0-9_-]+$`), and `list` queries must filter by `boardId` (`where('boardId', '==', ...)`).
3. Required keys (`id`, `boardId`, `toName`, `fromName`, `krathongStyle`, `flowerColor`, `candleColor`, `wishText`, `loveNote`, `imageData`, `heartsCount`, `createdAt`) must all be present, and no unapproved shadow fields are permitted (`hasOnly`).
4. `id` field must strictly match the path variable `{krathongId}`.
5. `krathongStyle`, `flowerColor`, and `candleColor` must belong to the strict allowlisted enums in `firebase-blueprint.json`.
6. `toName` (1..60), `fromName` (1..60), `wishText` (1..400), `loveNote` (0..600), and `imageData` (0..250000) must respect strict length bounds.
7. `imageData` must be empty, an `https://` URL, or a non-SVG `data:image/` URI.
8. On creation, `heartsCount` must be integer `0` and `createdAt` must equal `request.time`.
9. On update, ONLY `heartsCount` may change (`affectedKeys().hasOnly(['heartsCount'])`), and it must increment by exactly `+1` (`incoming().heartsCount == existing().heartsCount + 1`). All other fields remain immutable.
10. Deletion of `/krathongs/{krathongId}` is strictly restricted to `isAdmin()` (authenticated via Firebase Google Auth with `email_verified == true` for the bootstrapped admin email `galaxykillergz@gmail.com` or an `/admins/{uid}` record).
11. `/admins/{adminId}` only allows `get` by the matching authenticated user (`request.auth.uid == adminId`) to verify admin status; client `list` and `write` are denied.
