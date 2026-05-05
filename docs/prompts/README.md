# docs/prompts — Versioned Prompt Store

All system prompts longer than 5 lines live here. Route handlers import them via
`readPrompt()` from `frontend/lib/prompts.ts` — never inline in code.

## Directory structure

```
docs/prompts/
  <prompt-name>/
    v1.md
    v2.md
    ...
  README.md
  CHANGELOG.md
```

## Versioning rules

1. **Never edit an existing version.** `v1.md` is immutable once created.
2. To change a prompt, create `v(N+1).md` with the updated content.
3. Update `CHANGELOG.md` with the date, prompt name, what changed, and why.
4. Update the route handler to import the new version explicitly.

## How to import

```typescript
import { readPrompt } from '@/lib/prompts'

const systemPrompt = readPrompt('aliis-agent', 'v1')
```

The helper caches file contents in memory, so each prompt is read from disk only
once per process lifetime.

## Active versions

| Prompt | Active version | Source route/file |
|--------|---------------|-------------------|
| aliis-agent | v1 | `frontend/app/api/aliis/agent/route.ts` |
| chapter-chat | v1 | `frontend/app/api/chat/route.ts` |
| aliis-core | v1 | `frontend/lib/aliis-core.ts` |
| patient-context | v1 | `frontend/lib/patient-context.ts` |
| pack-generator | v1 | `backend/src/lib/generator.ts` |
