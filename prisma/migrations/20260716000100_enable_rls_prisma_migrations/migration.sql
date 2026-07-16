-- Prisma's own migration-history table lives in `public` too and was still
-- flagged by Supabase's Security Advisor after 20260716000000_enable_rls
-- covered every table declared in schema.prisma. Same reasoning applies:
-- Prisma connects as the table-owner role and bypasses RLS, so this only
-- closes the PostgREST-facing exposure.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
