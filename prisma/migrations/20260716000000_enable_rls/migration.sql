-- Enable Row-Level Security on every public table.
--
-- This app never queries Postgres through Supabase's auto-generated
-- PostgREST/GraphQL API — Prisma connects directly as the `postgres`
-- table-owner role, which bypasses RLS regardless of policies. So no
-- policies are added here; enabling RLS with zero policies simply makes
-- every table deny-by-default to the anon/authenticated PostgREST roles,
-- closing the public-API exposure Supabase flagged, without touching
-- app behavior.
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "requisitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "requisition_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchase_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchase_order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_settings" ENABLE ROW LEVEL SECURITY;
