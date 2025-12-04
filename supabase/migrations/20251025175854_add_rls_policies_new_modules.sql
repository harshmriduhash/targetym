-- Migration: Add RLS policies for new modules
-- Created: 2025-10-25

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- EMPLOYEES POLICIES
-- =============================================================================

-- SELECT: Users can view employees from their organization
CREATE POLICY "employees_select_policy" ON employees
    FOR SELECT
    USING (organization_id = get_user_organization_id());

-- INSERT: Users can create employees for their organization
CREATE POLICY "employees_insert_policy" ON employees
    FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

-- UPDATE: Users can update employees from their organization
CREATE POLICY "employees_update_policy" ON employees
    FOR UPDATE
    USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

-- DELETE: Only admins can delete employees
CREATE POLICY "employees_delete_policy" ON employees
    FOR DELETE
    USING (
        organization_id = get_user_organization_id()
        AND has_role('admin')
    );

-- =============================================================================
-- NOTICES POLICIES
-- =============================================================================

-- SELECT: Users can view notices from their organization
CREATE POLICY "notices_select_policy" ON notices
    FOR SELECT
    USING (organization_id = get_user_organization_id());

-- INSERT: Users can create notices for their organization
CREATE POLICY "notices_insert_policy" ON notices
    FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

-- UPDATE: Users can update notices from their organization
CREATE POLICY "notices_update_policy" ON notices
    FOR UPDATE
    USING (organization_id = get_user_organization_id())
    WITH CHECK (organization_id = get_user_organization_id());

-- DELETE: Only admins or authors can delete notices
CREATE POLICY "notices_delete_policy" ON notices
    FOR DELETE
    USING (
        organization_id = get_user_organization_id()
        AND (has_role('admin') OR author_id = auth.uid())
    );

-- =============================================================================
-- FORM ENTRIES POLICIES
-- =============================================================================

-- SELECT: Users can view form entries from their organization
CREATE POLICY "form_entries_select_policy" ON form_entries
    FOR SELECT
    USING (organization_id = get_user_organization_id());

-- INSERT: Users can create form entries for their organization
CREATE POLICY "form_entries_insert_policy" ON form_entries
    FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

-- UPDATE: Users can update form entries they submitted or if they're admin
CREATE POLICY "form_entries_update_policy" ON form_entries
    FOR UPDATE
    USING (
        organization_id = get_user_organization_id()
        AND (submitted_by_id = auth.uid() OR has_role('admin') OR has_role('hr'))
    )
    WITH CHECK (organization_id = get_user_organization_id());

-- DELETE: Only admins can delete form entries
CREATE POLICY "form_entries_delete_policy" ON form_entries
    FOR DELETE
    USING (
        organization_id = get_user_organization_id()
        AND has_role('admin')
    );

-- =============================================================================
-- PORTAL RESOURCES POLICIES
-- =============================================================================

-- SELECT: Users can view portal resources from their organization
CREATE POLICY "portal_resources_select_policy" ON portal_resources
    FOR SELECT
    USING (organization_id = get_user_organization_id());

-- INSERT: Admins and HR can create portal resources
CREATE POLICY "portal_resources_insert_policy" ON portal_resources
    FOR INSERT
    WITH CHECK (
        organization_id = get_user_organization_id()
        AND (has_role('admin') OR has_role('hr'))
    );

-- UPDATE: Admins, HR, or authors can update portal resources
CREATE POLICY "portal_resources_update_policy" ON portal_resources
    FOR UPDATE
    USING (
        organization_id = get_user_organization_id()
        AND (has_role('admin') OR has_role('hr') OR author_id = auth.uid())
    )
    WITH CHECK (organization_id = get_user_organization_id());

-- DELETE: Only admins can delete portal resources
CREATE POLICY "portal_resources_delete_policy" ON portal_resources
    FOR DELETE
    USING (
        organization_id = get_user_organization_id()
        AND has_role('admin')
    );

-- =============================================================================
-- SECURITY EVENTS POLICIES
-- =============================================================================

-- SELECT: Users can view their own security events, admins can view all
CREATE POLICY "security_events_select_policy" ON security_events
    FOR SELECT
    USING (
        organization_id = get_user_organization_id()
        AND (user_id = auth.uid() OR has_role('admin'))
    );

-- INSERT: System or admins can create security events
CREATE POLICY "security_events_insert_policy" ON security_events
    FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

-- UPDATE: No one can update security events (audit log)
-- DELETE: No one can delete security events (audit log)

-- =============================================================================
-- SUPPORT TICKETS POLICIES
-- =============================================================================

-- SELECT: Users can view their own tickets, admins and support can view all
CREATE POLICY "support_tickets_select_policy" ON support_tickets
    FOR SELECT
    USING (
        organization_id = get_user_organization_id()
        AND (user_id = auth.uid() OR has_role('admin') OR has_role('hr'))
    );

-- INSERT: Users can create support tickets for their organization
CREATE POLICY "support_tickets_insert_policy" ON support_tickets
    FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

-- UPDATE: Users can update their own tickets, support can update all
CREATE POLICY "support_tickets_update_policy" ON support_tickets
    FOR UPDATE
    USING (
        organization_id = get_user_organization_id()
        AND (user_id = auth.uid() OR has_role('admin') OR has_role('hr'))
    )
    WITH CHECK (organization_id = get_user_organization_id());

-- DELETE: Only admins can delete support tickets
CREATE POLICY "support_tickets_delete_policy" ON support_tickets
    FOR DELETE
    USING (
        organization_id = get_user_organization_id()
        AND has_role('admin')
    );

-- =============================================================================
-- FAQS POLICIES
-- =============================================================================

-- SELECT: Users can view FAQs from their organization
CREATE POLICY "faqs_select_policy" ON faqs
    FOR SELECT
    USING (organization_id = get_user_organization_id());

-- INSERT: Admins and HR can create FAQs
CREATE POLICY "faqs_insert_policy" ON faqs
    FOR INSERT
    WITH CHECK (
        organization_id = get_user_organization_id()
        AND (has_role('admin') OR has_role('hr'))
    );

-- UPDATE: Admins and HR can update FAQs
CREATE POLICY "faqs_update_policy" ON faqs
    FOR UPDATE
    USING (
        organization_id = get_user_organization_id()
        AND (has_role('admin') OR has_role('hr'))
    )
    WITH CHECK (organization_id = get_user_organization_id());

-- DELETE: Only admins can delete FAQs
CREATE POLICY "faqs_delete_policy" ON faqs
    FOR DELETE
    USING (
        organization_id = get_user_organization_id()
        AND has_role('admin')
    );

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON POLICY "employees_select_policy" ON employees IS 'Allow users to view employees from their organization';
COMMENT ON POLICY "notices_select_policy" ON notices IS 'Allow users to view notices from their organization';
COMMENT ON POLICY "form_entries_select_policy" ON form_entries IS 'Allow users to view form entries from their organization';
COMMENT ON POLICY "portal_resources_select_policy" ON portal_resources IS 'Allow users to view portal resources from their organization';
COMMENT ON POLICY "security_events_select_policy" ON security_events IS 'Allow users to view their security events, admins view all';
COMMENT ON POLICY "support_tickets_select_policy" ON support_tickets IS 'Allow users to view their tickets, support staff view all';
COMMENT ON POLICY "faqs_select_policy" ON faqs IS 'Allow users to view FAQs from their organization';
