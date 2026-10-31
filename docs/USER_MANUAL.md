# User Manual

All your data is stored in this browser only. Use **Settings → Full backup (JSON)** to keep a copy or to move to another device.

## Getting started
- **Get started** creates your own profile. Name and a valid email are required. The full sample curriculum is included, but you start with no history.
- **Explore demo student** loads *Aarav Sharma*, who has a month of sample activity, so you can see every feature at once.
- Navigation: use the left sidebar on desktop, or the ☰ menu on phones and tablets.

## Dashboard
Shows your subjects, topic totals, completed and pending topics, overall score (the mean of your latest score per topic), streak and learning time. **Recommended next topic** is the top PBWPS recommendation, with its reasons.

## Subjects
- **Add subject**: name, description and colour.
- Open a subject to **Add topic**: difficulty (1–5), importance (0–100), estimated minutes and prerequisites. Prerequisites that would create a circular dependency are greyed out.
- Expand a topic to **Start**, **Mark completed**, **Reset progress**, **Edit**, **Delete**, and add, edit or delete its multiple-choice questions (four options, one correct, with an explanation).
- Deleting a subject or topic also removes its questions, resources, results and progress, after you confirm.

## Assessments
- Filter by subject or status (unassessed, weak, assessed), then **Start** or **Retake**.
- Move between questions with Previous/Next or the numbered buttons. **Submit** is enabled only when every question is answered.
- The results page shows your score, performance band, how the topic's priority changed, and an answer review with explanations.
- **Attempt history** lists every attempt.

## Performance
Shows subject averages, a trend chart (each attempt plus the running average), the distribution across performance bands, strong and weak topics, and a sortable topic table with first, best and latest scores and their change. You can change the band thresholds in **Settings**.

## Recommendations
- A ranked list of topics you can study now. Expand a row to see *why* it was recommended. The coloured bar shows each factor's weighted contribution.
- **Locked topics** are waiting for prerequisites. A prerequisite counts as satisfied once it is completed or scored at or above the mastery score (default 60%).
- Move the **Priority weights** sliders to change the ranking instantly. **Reset** restores 0.40 / 0.25 / 0.20 / 0.15.
- **Method comparison** shows what the two baseline methods would recommend for you.

## Learning Path
A prerequisite-safe sequence of every topic you have not completed. Locked steps show which prerequisites are pending. Use **Start topic**, **Mark completed**, **Assess** and **Resources**. In **Completed topics**, click **Review** to log a revision, which resets that topic's revision need.

## Resources
Every topic has an explanation, a worked code example, a practice exercise, revision notes and self-check quiz material. Click a resource to read it, and **Mark done** to track it. **Add resource** creates your own; custom resources can be deleted.

## Study Schedule
- Set your daily hours, study days, an optional exam date and the maximum session length. The timetable regenerates automatically.
- Each day shows sessions in learning-path order. Mark sessions **Done** (this logs study time) or **Missed**.
- Past sessions that were not completed are marked missed automatically. **Reschedule missed** moves that work into future days.
- Warnings appear if the work does not fit before the exam, or if no study days are selected.

## Progress
Daily and weekly activity, subject completion, score improvement on retaken topics, and an activity log.

## Experiments
Runs a reproducible comparison of three recommendation methods on **simulated** students. Choose the seed, number of profiles (100–1000), top-K, weak threshold and study budget, then **Run experiment**. Export the results as CSV or JSON. These results describe algorithm behaviour on synthetic data, not real learning outcomes.

## Settings
- **Profile settings**: edit your details.
- **Recommendation weights** and **Learning preferences**: the assumed gap for unassessed topics, the prerequisite mastery score, memory stability, and the review threshold.
- **Performance thresholds**: the Developing, Good and Excellent boundaries. They must increase.
- **Data management**:
  - Export a JSON backup, topic progress as CSV, or assessments as CSV.
  - Import a JSON backup. It is validated and you confirm before anything is replaced.
  - **Reset to demo data**.
  - **Delete all data** (type DELETE to confirm).
