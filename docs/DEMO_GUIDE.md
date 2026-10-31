# Demonstration Guide (≈10 minutes)

**Preparation.** Run `npm run dev` (or open the deployed URL) in a fresh browser profile or private window. If data already exists, go to **Settings → Reset to demo data**.

## 1. Landing page (1 min)
- Point out the purpose, the feature cards, the "How it works" steps and the PBWPS formula.
- Click **Explore demo student**. You land on the dashboard for *Aarav Sharma*.

## 2. Dashboard (1 min)
- KPIs are computed live: subjects, completed and pending topics, overall score, streak, learning time.
- Show the **Recommended next topic** card and its reasons.
- Show the weekly activity chart and recent assessments.

## 3. Recommendations (2 min)
- Open **Recommendations**. Expand the first row to show the *why* list and the coloured factor bar.
- Scroll to **Locked topics**, for example *React Fundamentals*, which waits for *DOM Manipulation*.
- Drag the **Knowledge gap** weight to 0 and the **Importance** weight up. The ranking re-orders instantly. Click **Reset**.
- Show the **Method comparison** card: Method B's top five contains locked topics.

## 4. Take an assessment (2 min)
- From the top recommendation, click **Assess**, or open **Assessments → DOM Manipulation**.
- Click question 5 without answering: **Submit** is disabled.
- Answer all questions and submit. Show the score, band, **Priority before / now**, and the answer review with explanations.
- Click **View updated learning path**. If you scored ≥ 60%, *React Fundamentals* is now unlocked.

## 5. Learning path & schedule (2 min)
- On **Learning Path**, show the numbered roadmap, pending prerequisites, and the **Start** / **Mark completed** actions. Mark a topic completed and watch the path update.
- Open **Study Schedule**. Change daily hours from 2 to 1: the timetable regenerates and an over-capacity conflict may appear before the exam date. Toggle Saturday off. Mark a session **Done**.

## 6. Experiments (1 min)
- Open **Experiments** and point out the *simulated evaluation* notice.
- Click **Run experiment** (120 profiles). Walk through the table: C has the best relevance and 100% compliance; B has higher weak-topic identification. Explain the trade-off.

## 7. Data management (1 min)
- **Settings → Full backup (JSON)** downloads a file.
- Refresh the browser: all data is still there.
- Optionally import the backup again to show validation and confirmation.

**Fallbacks.** If anything looks wrong, **Settings → Reset to demo data** restores the starting state in one click.
