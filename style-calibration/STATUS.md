# Calibration status

Current stage: ready for the user's first review batch. See [FIRST-REVIEW.md](FIRST-REVIEW.md).

| Stage | State | Evidence / next action |
| --- | --- | --- |
| Snapshot survey | Complete | Aggregate measurements only; the tool and its runs are kept privately with the snapshot |
| Six task specifications and initial drafts | Complete | `TASK-CATALOG.md`, `INITIAL-MANIFEST.json`, and `pilot/` |
| Static validation and SSL test delivery | Complete | `VALIDATION.md`; 139 user-run SSL tests remain unexecuted |
| Human calibration | Awaiting review | Start with the focused examples |
| Accepted practice profiles | Pending user decisions | `PRACTICES.md` |
| Agent guidance / targeted LSP changes | Pending accepted practices | Complete rule specifications before edits |
| Three fresh transfer tasks | Pending reinforcement | Generate after guidance changes |
| Training admission / fine-tuning | Outside this milestone | Existing source policy remains in force |

Initial drafts must never be described as user-approved. No calibration-derived
agent standard or LSP rule has been introduced yet.

A demonstrated LSP correctness fix is implemented and tested: qualified object
members no longer trigger the bare-global assignment diagnostic. The existing
MCP binary remains at its pinned release; local checks use the rebuilt binary.
