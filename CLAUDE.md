# 🏛️ CLAUDE.md: 30-Day Finance App Challenge

## 📎 Related Files (READ ON STARTUP)
- **Read `AGENTS.md`** in the project root. It contains the Codex auditor prompt used in the audit-fix workflow described below.

## 🤖 System Behavior (CRITICAL)
- **Step-by-Step Execution:** Do not attempt to build the entire app at once. Perform the specific task requested, verify it works, and STOP.
- **Wait for Input:** After completing a step, wait for my feedback or the next instruction before proceeding.
- **No Over-Engineering:** Stick strictly to the current mission. Do not add "extra" features I haven't asked for yet.

## 📋 Project Startup Workflow (REQUIRED)
When starting a new project or feature, follow this process exactly:

1. **Start in Plan Mode** — Do NOT write any code. Enter plan mode first to research and design the implementation.
2. **Plan the project** — Explore the codebase, research requirements, and design a complete implementation plan.
3. **Present for verification** — Show the full plan to the user for review. Wait for feedback.
4. **Iterate if needed** — If the user wants changes, revise the plan and present it again. Repeat until the user approves.
5. **Create PLAN.md** — Once the user approves the plan, save the finalized plan as `PLAN.md` in the project root folder (same level as this file).
6. **STOP — Do NOT start building** — The plan mode session ends after creating `PLAN.md`. Do not begin any implementation. The user will execute the plan in a separate terminal window.

## 📊 Post-Build Report Protocol (REQUIRED)
After completing any build task (single step or multiple steps), you MUST generate a **Build Context Report** in the terminal before considering the task complete. The report must include:

1. **Summary of Changes** — List every file added or modified, and briefly describe the logic changes in each.
2. **Known Risks** — Call out any potential edge cases, assumptions made, or "vibe-coded" shortcuts taken. Be honest and specific.
3. **Codex Audit Prompt** — Generate a ready-to-copy prompt the user can paste directly into Codex. This prompt must instruct Codex to:
   - Perform a general audit of the new/modified code.
   - Check specifically for the known risks you identified above.
   - Output findings in a format that identifies the **specific file and line number** for each issue.

## 🔁 Audit-Fix Protocol (REQUIRED)
Your work is **NOT done** until the Audit-Fix loop is closed. When the user returns with Codex audit results:

1. **Analyze the audit report** — Read and understand every finding Codex identified.
2. **Propose fixes** — For every issue rated **High** or **Medium** risk, propose a specific fix with the exact code change.
3. **Wait for approval** — Do NOT apply any fixes until the user approves them. Present the proposed fixes and wait for confirmation before making changes.

### Loop Prevention Rules

#### Rule: Diminishing Returns
If a file has already been audited and fixed once, do NOT generate a new Codex audit prompt for it unless:
- A **Functional Bug** is discovered (code doesn't run), OR
- A **Security Vulnerability** is identified.
Do not re-audit for style preferences or minor optimizations. One audit-fix pass per file is sufficient.

#### Rule: Definition of "Done"
A task is considered **Done** when ALL of the following are true:
1. The code meets the requirements defined in `PLAN.md`.
2. The code passes a basic build check (`npm run build` or similar).
3. No **High** severity risks remain from the audit.

Once these conditions are met, move on to the next step.

#### Rule: Silence is Approval
If the audit results contain ONLY **Low** priority or **Nitpick** suggestions:
- Acknowledge the findings briefly.
- Do NOT generate a fix prompt.
- Move directly to the next step in `PLAN.md`.

## 🏗️ Scaffolding Protocol (REQUIRED)

### Rule: The Foundation Step
Step 1 of every new project MUST be **Scaffolding**. In this step, you must:
1. **Create the core directory structure** — Set up the essential folders (e.g., `/src/components`, `/src/lib`, `/src/types`) as defined in the plan.
2. **Initialize global configuration files** — Layouts, Providers, Global CSS, and any project-level config.
3. **Verify "Hello World" state** — The project must run successfully with a minimal "Hello World" rendering before moving to any feature work.

### Rule: Progressive File Creation
Do NOT create empty files for future steps. Only create the files necessary for the **current step** being executed. This keeps the workspace clean and prevents AI context drift.

### Rule: The Directory Map
Every time you finish the Scaffolding step, output a clean **ASCII directory tree** in the terminal so the user can see the full project structure at a glance.

## 🎨 Design & Theme (Standardized)
- **Background:** Always `bg-slate-950` (Deep Dark Mode).
- **Cards:** `bg-slate-900` with `border border-slate-800` and `rounded-xl`.
- **Typography:** Sans-serif (Inter). Headings: `text-slate-100`, Subtext: `text-slate-400`.
- **The Traffic Light Palette:**
  - **Success/Buy:** `text-emerald-400` / `bg-emerald-500/10`
  - **Warning/Wait:** `text-amber-400` / `bg-amber-500/10`
  - **Danger/Sell:** `text-rose-400` / `bg-rose-500/10`
  - **Neutral:** `text-sky-400` / `bg-sky-500/10`

## 🗣️ Tone & Language (Beginner-First)
- **The "Friend" Test:** No jargon. Explain concepts simply (e.g., "Momentum" instead of "Relative Strength Index").
- **Legal Safety:** Use "Likely," "Potential," or "Historically." **NEVER** promise profits or use certainties.
- **The "Aha!" Moment:** Every app must feature one clear visual (Gauge, Meter, or Light) that gives an answer in <3 seconds.

## 🛠️ Technical Architecture
- **Mobile-First:** Ensure large touch targets and readable text on small screens.
- **Search:** Persistent ticker search bar at the top of the main view.
- **Clean Code:** No console logs, no unused imports. Centralize API logic in `lib/services/`.
