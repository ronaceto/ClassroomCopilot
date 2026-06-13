# Curriculum Map

This folder turns `AI for Students` into the content backbone for Classroom Copilot's AI Curriculum Builder.

## Files

- `book-structure-draft.md`: table-of-contents based outline from the source PDF.
- `ai-for-students-curriculum-map.md`: human-readable curriculum map with units, modules, objectives, vocabulary, activities, assessments, and AI-use guardrails.
- `data/modules.json`: structured version for future app use.

## Current Shape

- 5 units
- 21 lesson modules
- 1 module per book chapter
- Default target: grades 8-12
- Default generation target: 45-60 minute lesson pack

## App Integration Notes

The curriculum builder should use `data/modules.json` as the selectable source model:

- Unit selector
- Module selector
- Grade and reading-level adjustments
- Standards target
- Student AI access level
- Deliverable type

The app should use the markdown map as the teacher-facing planning reference and the JSON file as the implementation-friendly data source.
