# ADR-0019: Unsafe export override is API-only and gated behind demo flags + admin token

Status: accepted  
Date: 2026-02-07  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
The system is built to protect trust by default: if verification breaks, exports are blocked (fail-closed). Sometimes, a demo still needs to show the shape of an export even when trust is broken. ADR-0019 adds a break-glass bypass, but makes it hard to do accidentally.

It is hard in three ways:
- It is API-only (no UI toggle).
- It only works in demo environments (two explicit env flags).
- It requires an admin token header to prove intent.

Anything exported this way must clearly signal "this is untrusted" via visible labeling and recorded metadata.

## Metaphor/analogy (with mapping + where it breaks)
Think of exporting as taking a package through a security checkpoint. If the package fails inspection, it normally cannot leave the building. For drills, there is a locked bypass lane, but you can only use it when the building is in drill mode, the bypass is explicitly enabled, and you have the security chief's key. Any package that uses the bypass gets a big "UNSAFE" stamp and a logbook entry.

Mapping:
- Export blocking when trust breaks: checkpoint refusing failed packages (ADR-0002).
- `unsafe_override=true`: choosing the bypass lane.
- `DEMO_MODE=1`: building is in drill mode.
- `ALLOW_UNSAFE_EXPORTS=1`: bypass is explicitly enabled.
- `X-Orbital-Admin-Token` matching `ORBITAL_ADMIN_TOKEN`: the key (ADR-0018).
- Filename suffix `.UNSAFE` + artifact metadata: the stamp + logbook entry.
- No UI affordance: no public sign pointing to the bypass lane.

Where the metaphor breaks:
- Real systems prefer audited roles over env flags; this is a PoC v1 control surface.
- Tokens are easier to leak than physical keys, so secret hygiene matters.

## Visual explanation (small ASCII diagram)
```text
                   (PoC v1 UI)
[Trust Substrate UI] --------------X--------------> [unsafe export override]

                        (API)
[API client] --> [Export endpoint with unsafe_override=true]
                    |
                    v
            [All gates must pass]
            - DEMO_MODE=1
            - ALLOW_UNSAFE_EXPORTS=1
            - X-Orbital-Admin-Token matches ORBITAL_ADMIN_TOKEN
                    |
         +----------+-----------+
         |                      |
         v                      v
 [Gates fail]              [Gates pass]
 Fail-closed export         Export allowed even if trust breaks
 (normal posture)           Artifact labeled *.UNSAFE + metadata recorded
```

## Step-by-step breakdown
1. Normal posture: if trust breaks, exports are blocked (fail-closed).
2. A demo caller can request an override by setting `unsafe_override=true` on the export API call.
3. The server checks `DEMO_MODE=1`.
4. The server checks `ALLOW_UNSAFE_EXPORTS=1`.
5. The server checks `X-Orbital-Admin-Token` matches `ORBITAL_ADMIN_TOKEN` (ADR-0018).
6. If any gate fails, export remains blocked by default.
7. If all gates pass, export proceeds but must be visibly and durably marked unsafe (e.g. filename suffix `.UNSAFE`) and recorded in artifact metadata.

Inputs:
- Request parameter: `unsafe_override=true`
- Environment: `DEMO_MODE=1` and `ALLOW_UNSAFE_EXPORTS=1`
- Header: `X-Orbital-Admin-Token` matching `ORBITAL_ADMIN_TOKEN`

Outputs:
- An export artifact that may include unverified content.
- Unsafe labeling and metadata indicating the override was used.

Constraints:
- API-only (no UI toggle).
- All gates must be true.
- Unsafe labeling and metadata recording are mandatory.

Trade-offs:
- Enables a controlled demo escape hatch without weakening the default trust posture.
- Adds flag complexity and operational burden (env flags + admin token).

Failure modes:
- Demo flags accidentally enabled in non-demo env; combined with leaked admin token enables unsafe exports.
- Artifact not labeled; viewers mistake unsafe export for trusted.
- Teams treat "export succeeded" as success signal, masking trust breaks.

Why this design vs alternatives:
- UI toggle: rejected because it normalizes an unsafe path in the Trust Substrate UI.
- Token-only gating: rejected because flags add a second lock to reduce accidental enablement.
- Full auth/roles: stronger long-term, but heavier than PoC v1 needs.

## Common misunderstandings
- "Unsafe override makes the export safe." It explicitly bypasses export blocking when trust breaks.
- "DEMO_MODE=1 is enough." You also need `ALLOW_UNSAFE_EXPORTS=1` and the correct admin token.
- "The `.UNSAFE` suffix is cosmetic." It is required user-visible signaling and must be backed by metadata.
- "We can log the admin token to debug." Do not; treat it as a secret and never log it.

## Check understanding (teach-back question)
Explain: when `unsafe_override=true` is allowed, what inputs must be present (request + env), what outputs are produced, and how the system prevents someone from mistaking an unsafe export for a trusted one (and why the UI does not expose this).

