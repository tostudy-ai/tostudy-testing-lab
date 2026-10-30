# Reservation API

Base path: `/api/v1`. The demonstration client supplies `x-demo-user: alice` or `x-demo-user: bob`.
This explicit classroom identity is not authentication and must not be used in production.
Success uses `{data, meta:{requestId}}`; errors use `{error:{code,message}, meta:{requestId}}`.
Request bodies must be JSON, at most 16 KiB, and contain only the documented fields.
Dates require ISO timestamps with an explicit offset; the server normalizes them to UTC.

| Method and path | Input | Result |
|---|---|---|
| `GET /rooms` | Demo identity | Room list and pagination metadata |
| `GET /bookings` | Optional `page` and `perPage` (1–100) | Paginated reservation list |
| `POST /bookings` | `{roomId,start,end}` | 201 and the new reservation |
| `DELETE /bookings/:id` | Demo identity | 204 for the owner; 403 for another user |
| `GET /health` | None | 200 readiness response |

Equal endpoints are adjacent, not overlapping. An end must be strictly after its start.
Overlaps only conflict in the same room. Concurrent requests in this single-process store cannot both claim one slot.
Unknown rooms and invalid fields return 422; malformed JSON returns 400; conflicts return 409.
Missing or unknown identity returns 401, unsupported content type 415, oversized body 413 and missing resources 404.
The response owner is derived from the demo identity, never a body field.
The room catalogue is loaded from disk at runtime. It is deliberately outside the static import graph.
The browser lists up to 100 reservations; this is a bounded classroom interface, not a production calendar.
