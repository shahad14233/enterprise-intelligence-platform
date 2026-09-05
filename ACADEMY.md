# AI Engineer Expert Academy

A self-contained static academy for expert-level preparation across the seven supplied SDAIA AI Engineer Badge domains.

## Run locally

Open `docs/index.html` directly, or serve the repository with any static file server. No Node, npm, build step, database, or backend is required by the academy.

## GitHub Pages

Enable **Settings → Pages → Source: Deploy from a branch → main → /docs → Save**. The academy is static and requires no custom workflow. Pages on a private repository requires an eligible GitHub plan; on GitHub Free, publish from a public repository.

## Content and schedule

- 78 explicitly dated sessions from 6 September through 4 December 2026
- Friday rest days except the final light review on 4 December
- 5 December is recorded as exam-only: 140 questions, 210 minutes, 3:30–7:00 PM
- 582 lesson practice questions, each with four option-level rationales
- Seven timed domain exams, two 140-question mocks, and one 50-question mixed mode
- Local progress, flags, mistake bank, mastery and +1/+3/+7/+14 reviews under `aiEngineerExpertAcademyV1`

All practice is labeled as custom Certification-style Practice or Expert Practice. It is not presented as official SDAIA exam content, and no passing score is invented.

## Quality checks

Run `node scripts/audit.js` to validate the dates, domains, lesson requirements, question counts, option rationales, source keys and assessment configurations. `scripts/smoke.js` can run browser checks when Playwright Chromium is installed.
