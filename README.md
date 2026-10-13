# Team Odyssey

This is a website for the rover team.

Run `npm run dev` to start the Astro development server and `npm run build`
to generate the static site. `npm run check` runs Astro, ESLint, formatting,
and regression checks.
After building, run `npm run check:output` to check local links, media,
headings, and the team-page alias in the generated site.

Pages live in `src/pages`, field notes in `src/data/post`, and team profiles
in `src/data/teams.ts`. The CMS uses the same post folder and stores uploaded
images in `public/uploads`.
