-- Comprehensive RLS Policy Fix
-- This migration ensures all tables with RLS enabled have proper policies
-- Fixes the immediate issue with customers table and prevents future RLS issues

-- ============================================
-- 1. CUSTOMERS TABLE - Immediate Fix
-- ============================================
-- Customers table has RLS enabled but no policies, causing insert failures
DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;
CREATE POLICY "Allow all operations on customers" 
ON public.customers FOR ALL USING (true);

-- ============================================
-- 2. STATIONS TABLE
-- ============================================
-- Stations table has RLS enabled but no policies
DROP POLICY IF EXISTS "Allow all operations on stations" ON public.stations;
CREATE POLICY "Allow all operations on stations" 
ON public.stations FOR ALL USING (true);

-- ============================================
-- 3. BOOKINGS TABLE
-- ============================================
-- Ensure bookings table has RLS policy (if RLS is enabled)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'bookings'
        AND c.relrowsecurity = true
    ) THEN
        -- Check if policy exists, if not create it
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'bookings'
            AND policyname = 'Allow all operations on bookings'
        ) THEN
            CREATE POLICY "Allow all operations on bookings" 
            ON public.bookings FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 4. BILLS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'bills'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'bills'
            AND policyname = 'Allow all operations on bills'
        ) THEN
            CREATE POLICY "Allow all operations on bills" 
            ON public.bills FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 5. BILL_ITEMS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'bill_items'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'bill_items'
            AND policyname = 'Allow all operations on bill_items'
        ) THEN
            CREATE POLICY "Allow all operations on bill_items" 
            ON public.bill_items FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 6. PRODUCTS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'products'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'products'
            AND policyname = 'Allow all operations on products'
        ) THEN
            CREATE POLICY "Allow all operations on products" 
            ON public.products FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 7. LOYALTY_TRANSACTIONS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'loyalty_transactions'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'loyalty_transactions'
            AND policyname = 'Allow all operations on loyalty_transactions'
        ) THEN
            CREATE POLICY "Allow all operations on loyalty_transactions" 
            ON public.loyalty_transactions FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 8. CUSTOMER_USERS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'customer_users'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'customer_users'
            AND policyname = 'Allow all operations on customer_users'
        ) THEN
            CREATE POLICY "Allow all operations on customer_users" 
            ON public.customer_users FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 9. BOOKING_VIEWS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'booking_views'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'booking_views'
            AND policyname = 'Allow all operations on booking_views'
        ) THEN
            CREATE POLICY "Allow all operations on booking_views" 
            ON public.booking_views FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 10. CASH_TRANSACTIONS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'cash_transactions'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'cash_transactions'
            AND policyname = 'Allow all operations on cash_transactions'
        ) THEN
            CREATE POLICY "Allow all operations on cash_transactions" 
            ON public.cash_transactions FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 11. CASH_DEPOSITS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'cash_deposits'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'cash_deposits'
            AND policyname = 'Allow all operations on cash_deposits'
        ) THEN
            CREATE POLICY "Allow all operations on cash_deposits" 
            ON public.cash_deposits FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 12. REWARDS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'rewards'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'rewards'
            AND policyname = 'Allow all operations on rewards'
        ) THEN
            CREATE POLICY "Allow all operations on rewards" 
            ON public.rewards FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 13. REWARD_REDEMPTIONS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'reward_redemptions'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'reward_redemptions'
            AND policyname = 'Allow all operations on reward_redemptions'
        ) THEN
            CREATE POLICY "Allow all operations on reward_redemptions" 
            ON public.reward_redemptions FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 14. REFERRALS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'referrals'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'referrals'
            AND policyname = 'Allow all operations on referrals'
        ) THEN
            CREATE POLICY "Allow all operations on referrals" 
            ON public.referrals FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 15. PROMOTIONS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'promotions'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'promotions'
            AND policyname = 'Allow all operations on promotions'
        ) THEN
            CREATE POLICY "Allow all operations on promotions" 
            ON public.promotions FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 16. NOTIFICATIONS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'notifications'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'notifications'
            AND policyname = 'Allow all operations on notifications'
        ) THEN
            CREATE POLICY "Allow all operations on notifications" 
            ON public.notifications FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 17. NOTIFICATION_TEMPLATES TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'notification_templates'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'notification_templates'
            AND policyname = 'Allow all operations on notification_templates'
        ) THEN
            CREATE POLICY "Allow all operations on notification_templates" 
            ON public.notification_templates FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 18. EMAIL_TEMPLATES TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'email_templates'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'email_templates'
            AND policyname = 'Allow all operations on email_templates'
        ) THEN
            CREATE POLICY "Allow all operations on email_templates" 
            ON public.email_templates FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 19. STAFF_PROFILES TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'staff_profiles'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'staff_profiles'
            AND policyname = 'Allow all operations on staff_profiles'
        ) THEN
            CREATE POLICY "Allow all operations on staff_profiles" 
            ON public.staff_profiles FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 20. STAFF_ATTENDANCE TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'staff_attendance'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'staff_attendance'
            AND policyname = 'Allow all operations on staff_attendance'
        ) THEN
            CREATE POLICY "Allow all operations on staff_attendance" 
            ON public.staff_attendance FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 21. STAFF_LEAVE_REQUESTS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'staff_leave_requests'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'staff_leave_requests'
            AND policyname = 'Allow all operations on staff_leave_requests'
        ) THEN
            CREATE POLICY "Allow all operations on staff_leave_requests" 
            ON public.staff_leave_requests FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 22. STAFF_WORK_SCHEDULES TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'staff_work_schedules'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'staff_work_schedules'
            AND policyname = 'Allow all operations on staff_work_schedules'
        ) THEN
            CREATE POLICY "Allow all operations on staff_work_schedules" 
            ON public.staff_work_schedules FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 23. INVESTMENT_PARTNERS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'investment_partners'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'investment_partners'
            AND policyname = 'Allow all operations on investment_partners'
        ) THEN
            CREATE POLICY "Allow all operations on investment_partners" 
            ON public.investment_partners FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 24. INVESTMENT_TRANSACTIONS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'investment_transactions'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'investment_transactions'
            AND policyname = 'Allow all operations on investment_transactions'
        ) THEN
            CREATE POLICY "Allow all operations on investment_transactions" 
            ON public.investment_transactions FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 25. ADMIN_USERS TABLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'admin_users'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'admin_users'
            AND policyname = 'Allow all operations on admin_users'
        ) THEN
            CREATE POLICY "Allow all operations on admin_users" 
            ON public.admin_users FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 26. TOURNAMENT_STATS TABLE (if RLS is enabled)
-- ============================================
-- Note: This table already has a policy from previous migrations, but ensuring it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'tournament_stats'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'tournament_stats'
            AND policyname = 'Allow all operations on tournament_stats'
        ) THEN
            CREATE POLICY "Allow all operations on tournament_stats" 
            ON public.tournament_stats FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- 27. CASH_SUMMARY TABLE (if RLS is enabled)
-- ============================================
-- Note: This table already has RLS enabled from previous migrations
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'cash_summary'
        AND c.relrowsecurity = true
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'cash_summary'
            AND policyname = 'Allow all operations on cash_summary'
        ) THEN
            CREATE POLICY "Allow all operations on cash_summary" 
            ON public.cash_summary FOR ALL USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- Summary Comment
-- ============================================
COMMENT ON POLICY "Allow all operations on customers" ON public.customers IS 
'Allows all operations (SELECT, INSERT, UPDATE, DELETE) on customers table. This fixes the RLS policy violation error when creating new customers.';

COMMENT ON POLICY "Allow all operations on stations" ON public.stations IS 
'Allows all operations (SELECT, INSERT, UPDATE, DELETE) on stations table.';

