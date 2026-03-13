---
description: "Break down a feature into small, independent implementation tasks by delegating to the ✅ Task agent."
argument-hint: "Feature folder name under specs/features/ (e.g. '001-github-login')"
agent: "✅ Task"
---

Delegate entirely to the **✅ Task** agent.

The feature to create tasks for is: **{{feature-name}}**

Load the approved spec artifacts from the feature folder:

- `specs/features/{{feature-name}}/*.md` — approved technical design (`DES-*` identifiers)

Each task must be:

- Small and independently executable
- Traceable to a `REQ-*` and `DES-*` identifier
- Include explicit **Done When** criteria
