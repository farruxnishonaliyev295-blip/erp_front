# ERP Education CRM — Reference UI Redesign

This version keeps the existing React/Vite application structure and API services while updating the visual system to closely follow the supplied ERP reference image.

## UI changes
- Deep green sidebar + lime/yellow active state
- ERP EDUCATION CRM branding
- White topbar with breadcrumb, global search, theme and profile controls
- Reference-style page banner with icon and decorative education artwork
- Rounded white filters/table surfaces with soft shadows
- Students page converted from cards to the reference-style data table
- Green status/balance styling and compact action buttons
- Responsive layout
- Notification bell dropdown with unread count, mark-all-read behavior, item read behavior and link to the full notifications page
- Notifications page restyled to the same visual language

## Run
```bash
npm install
npm run dev
```

The archive intentionally does not include `node_modules`.


## Backend integration
This frontend is wired to the NestJS backend supplied with the project.
- API base: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs#/`
- Auth uses httpOnly cookies with `credentials: include`.
- Students, teachers, admins, courses, groups, rooms, payments, lessons, attendance, exams, homework, reports, dashboards and notifications use backend endpoints.
- Demo/mock data was removed. Library and Help Center show an empty state because the supplied backend has no library/FAQ endpoints.
