-- Migration: Add new modules (Employees, Notices, Forms, Portal, Security, Help)
-- Created: 2025-10-25

-- =============================================================================
-- EMPLOYEES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on-leave', 'inactive')),
    hire_date DATE NOT NULL,
    location TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

-- Indexes for employees
CREATE INDEX idx_employees_organization_id ON employees(organization_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);

-- Updated_at trigger for employees
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- NOTICES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('urgent', 'info', 'announcement', 'event')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    department TEXT,
    views INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notices
CREATE INDEX idx_notices_organization_id ON notices(organization_id);
CREATE INDEX idx_notices_type ON notices(type);
CREATE INDEX idx_notices_priority ON notices(priority);
CREATE INDEX idx_notices_author_id ON notices(author_id);
CREATE INDEX idx_notices_created_at ON notices(created_at DESC);

-- Updated_at trigger for notices
CREATE TRIGGER update_notices_updated_at
    BEFORE UPDATE ON notices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FORM ENTRIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS form_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    form_name TEXT NOT NULL,
    submitted_by_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in-review', 'approved', 'rejected')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    form_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for form_entries
CREATE INDEX idx_form_entries_organization_id ON form_entries(organization_id);
CREATE INDEX idx_form_entries_status ON form_entries(status);
CREATE INDEX idx_form_entries_submitted_by_id ON form_entries(submitted_by_id);
CREATE INDEX idx_form_entries_reviewed_by_id ON form_entries(reviewed_by_id);
CREATE INDEX idx_form_entries_submitted_at ON form_entries(submitted_at DESC);

-- Updated_at trigger for form_entries
CREATE TRIGGER update_form_entries_updated_at
    BEFORE UPDATE ON form_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- PORTAL RESOURCES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS portal_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('document', 'video', 'guide', 'policy', 'training')),
    category TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    views INTEGER NOT NULL DEFAULT 0,
    downloads INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    url TEXT,
    file_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for portal_resources
CREATE INDEX idx_portal_resources_organization_id ON portal_resources(organization_id);
CREATE INDEX idx_portal_resources_type ON portal_resources(type);
CREATE INDEX idx_portal_resources_category ON portal_resources(category);
CREATE INDEX idx_portal_resources_author_id ON portal_resources(author_id);
CREATE INDEX idx_portal_resources_featured ON portal_resources(featured) WHERE featured = TRUE;
CREATE INDEX idx_portal_resources_published_at ON portal_resources(published_at DESC);

-- Updated_at trigger for portal_resources
CREATE TRIGGER update_portal_resources_updated_at
    BEFORE UPDATE ON portal_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SECURITY EVENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('login', 'password-change', 'permission-change', 'suspicious-activity')),
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    location TEXT,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'blocked')),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for security_events
CREATE INDEX idx_security_events_organization_id ON security_events(organization_id);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(type);
CREATE INDEX idx_security_events_status ON security_events(status);
CREATE INDEX idx_security_events_timestamp ON security_events(timestamp DESC);

-- =============================================================================
-- SUPPORT TICKETS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for support_tickets
CREATE INDEX idx_support_tickets_organization_id ON support_tickets(organization_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_assigned_to_id ON support_tickets(assigned_to_id);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Updated_at trigger for support_tickets
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FAQS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faqs
CREATE INDEX idx_faqs_organization_id ON faqs(organization_id);
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_order_index ON faqs(order_index);

-- Updated_at trigger for faqs
CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE employees IS 'Employee management - stores employee information and status';
COMMENT ON TABLE notices IS 'Notice board - company announcements and communications';
COMMENT ON TABLE form_entries IS 'Form submissions - tracks all form entries and their approval workflow';
COMMENT ON TABLE portal_resources IS 'Information portal - company resources, documents, and training materials';
COMMENT ON TABLE security_events IS 'Security audit log - tracks security-related events';
COMMENT ON TABLE support_tickets IS 'Help desk - support ticket management';
COMMENT ON TABLE faqs IS 'Frequently asked questions - knowledge base';
