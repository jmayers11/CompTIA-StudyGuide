# Security notes

**Threat model.** This is a personal, offline study app with no accounts and no server. The realistic risks are:
1. a crafted backup or Markdown file injecting script or corrupting data;
2. corrupted storage breaking the app;
3. user-entered text (notes, ticket notes, notebook notes, queries) being rendered as HTML;
4. leaking study data.

## Controls
| Risk | Control | Test |
|---|---|---|
| Script injection through user text | All user and content text is rendered through `escapeHtml`. Note IDs written into attributes are escaped (fixed in Phase 3). Queries, ticket notes and notebook notes are escaped. | `app-security`, `soc-sim`, `evidence`, `query-sandbox` |
| Crafted notes | `sanitizeNotesArray` runs on every load and import: plain objects only, IDs limited to `[A-Za-z0-9_.:-]`, text fields made into strings, tags into a string list, nested objects and `__proto__` keys dropped | `app-security` |
| Crafted backups | `validateBackupPayload` only accepts the allow-listed keys. Values must be strings (objects are re-serialized), JSON values must parse, and notes are sanitized. Files over 40 MB are refused. An undo copy is kept. Nothing is ever evaluated as code. | `app-security` (prototype pollution, invalid JSON, unknown keys, oversized file, non-execution) |
| Corrupted storage | `STORAGE_REPAIR` runs before anything else. Wrong-shaped values are quarantined and that feature starts fresh, with a notice. | `app-security`: every key holding null, numbers, strings, arrays with null entries and invalid JSON |
| Tampered third-party code | SRI hashes on both CDN scripts, plus a clear failure message on the import features | `app-security` (integrity and crossorigin present) |
| Data leakage | No analytics, no network calls at runtime apart from the optional CDN libraries for file import. The progress report and backups are files you choose to save. | — |

## Known limitations
- **No Content-Security-Policy.** The app is one file with inline scripts, so a strict CSP would need a build step that moves scripts into separate files.
- **Two scripts come from cdnjs** (jszip and pdf.js, used only for importing files). Since Phase 4 they carry Subresource Integrity hashes (SHA-512) with `crossorigin="anonymous"`, so a modified file is refused by the browser (tested live: a wrong hash is blocked). If a library is blocked or offline, PowerPoint and PDF import show a clear message, and the rest of the app is unaffected. The pdf.js worker is still loaded by URL, which browsers can't pin with SRI; bundling the libraries would remove the CDN dependence completely.
- **No encryption at rest.** `localStorage` is readable by anyone with access to the browser profile. Don't put secrets in notes.
- The app relies on escaping rather than a sanitizer library. A missed `escapeHtml` in future code would reintroduce XSS, and `app-security.test.js` scans every tab with hostile data to catch this.
