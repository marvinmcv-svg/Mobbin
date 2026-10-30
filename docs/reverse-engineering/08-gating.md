# 08 · Free vs paid gating (studied, not circumvented)

| Claim | Label |
|---|---|
| `/discover/*` requires login; anonymous users are redirected to `/?redirect_to=…` | Seen |
| Public explore pages show a fixed first page (~60 cards) then a sign-up wall with social and "other options" sign-in | Seen |
| Save/copy actions gate to a sign-up modal route | Seen |
| Images are served via signed/encoded CDN URLs | Seen |
| What free vs paid members see after login | Unknown |

## Our decision
Tiering is configuration (`ACCESS_LIMITS` in `lib/config.ts`): anonymous preview count,
member limits, admin. The library defaults to invite-only.
