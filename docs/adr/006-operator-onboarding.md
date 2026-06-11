# ADR-006: Operator Onboarding

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-06-11 |

## Decision

Self-serve signup — operator creates org, adds locations, downloads QR codes.

## Rationale (MVP)

No manual provisioning bottleneck. One shared login per org initially.

## Revisit when

Franchisees need per-location manager access, SSO, or enterprise sales require admin-controlled provisioning.

## Future options

Invite flow with scoped RBAC (owner vs location manager); SSO (SAML/OIDC); admin super-panel for support.

## Fault tolerance gaps

No org verification / abuse prevention on self-serve signup.
