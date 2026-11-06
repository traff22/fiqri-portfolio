# Colour grade before / after

For any project, add a pair of frames, raw (or log) and graded. A comparison slider then appears in that project's video dialog. With an empty `grades.json` (`{}`), nothing shows.

## Export spec

- The **same frame**, exported twice: before grading and after. Use a still that shows what the grade does (skin, sky, mood).
- 1280×720 (16:9) JPEG, quality around 80 (about 150–250 KB each).
- Name the files after the project, for example `cinematic-mancing-raw.jpg` and `cinematic-mancing-graded.jpg`.

## grades.json

The keys are the project ids used in Selected Work (`data-project` in `index.html`):

```json
{
  "cinematic-mancing": {"before":"assets/grades/cinematic-mancing-raw.jpg","after":"assets/grades/cinematic-mancing-graded.jpg","labels":["Log","Graded"]}
}
```

`labels` is optional (default: "Raw" / "Graded").
