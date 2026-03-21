---
description: Keep Supabase SQL artifacts in sync via CLI
---
1. **Install the Supabase CLI (once per machine)**
   ```bash
   brew install supabase/tap/supabase
   ```
   > Linux/Windows: follow https://supabase.com/docs/guides/cli
2. **Log in so the CLI can talk to your project**
   ```bash
   supabase login
   ```
   Paste a personal access token from https://supabase.com/dashboard/account/tokens.
3. **Link the local repo to the right Supabase project**
   - Export `SUPABASE_PROJECT_REF` (the `xxxxxxxxxxxx` part of your project URL) in your shell or add it to `.env`.
   - Run:
     ```bash
     supabase link --project-ref "$SUPABASE_PROJECT_REF"
     ```
     This writes a `.supabase/config.toml` that the CLI uses for every command.
4. **Pull the latest remote schema so `supabase/` SQL stays current**
   ```bash
   supabase db pull --linked --schema public --write-sql supabase/schema.sql
   ```
   Commit the updated `supabase/schema.sql` (and any generated migrations) so Windsurf stays aware of DB shape changes.
5. **Auto-update SQL while you iterate (optional but recommended)**
   ```bash
   npx --yes watchexec -r -e sql "supabase db pull --linked --schema public --write-sql supabase/schema.sql"
   ```
   - Leave this running in a Windsurf terminal pane; every time you edit a SQL migration the watcher refreshes `schema.sql`.
6. **Push changes back to Supabase when ready**
   ```bash
   supabase db push --linked
   ```
   This applies the migrations generated locally to your remote database.
7. **CI hint**
   - Ensure GitHub/Vercel secrets contain `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_PROJECT_REF` so automated runs can execute the same workflow if needed.
