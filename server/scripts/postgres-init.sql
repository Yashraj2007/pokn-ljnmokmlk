-- PostgreSQL initialization script for PMIS SmartMatch+
-- Creates tables for analytics and time-series data

-- Create database if not exists (handled by Docker)
-- CREATE DATABASE IF NOT EXISTS pmis;

-- Use the pmis database
\c pmis;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Analytics tables for time-series data
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    candidate_id VARCHAR(24),
    internship_id VARCHAR(24),
    application_id VARCHAR(24),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_analytics_events_type (event_type),
    INDEX idx_analytics_events_created (created_at),
    INDEX idx_analytics_events_candidate (candidate_id),
    INDEX idx_analytics_events_internship (internship_id)
);

-- Daily metrics aggregation table
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_registrations INTEGER DEFAULT 0,
    total_applications INTEGER DEFAULT 0,
    total_offers INTEGER DEFAULT 0,
    total_joins INTEGER DEFAULT 0,
    dropout_rate DECIMAL(5,2) DEFAULT 0,
    avg_match_score DECIMAL(5,2) DEFAULT 0,
    top_districts JSONB DEFAULT '[]',
    top_companies JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills analytics table
CREATE TABLE IF NOT EXISTS skill_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name VARCHAR(100) NOT NULL,
    canonical_name VARCHAR(100) NOT NULL,
    demand_score INTEGER DEFAULT 0,
    supply_score INTEGER DEFAULT 0,
    match_success_rate DECIMAL(5,2) DEFAULT 0,
    avg_stipend DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(canonical_name)
);

-- Location analytics table
CREATE TABLE IF NOT EXISTS location_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    total_candidates INTEGER DEFAULT 0,
    total_internships INTEGER DEFAULT 0,
    avg_stipend DECIMAL(10,2) DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(district, state)
);

-- Company performance table
CREATE TABLE IF NOT EXISTS company_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    total_internships INTEGER DEFAULT 0,
    total_applications INTEGER DEFAULT 0,
    total_hires INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    reliability_score INTEGER DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_name)
);

-- Model performance tracking
CREATE TABLE IF NOT EXISTS model_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    accuracy DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    training_date TIMESTAMP WITH TIME ZONE NOT NULL,
    validation_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_skill_analytics_demand ON skill_analytics(demand_score DESC);
CREATE INDEX IF NOT EXISTS idx_location_analytics_state ON location_analytics(state);
CREATE INDEX IF NOT EXISTS idx_company_performance_rating ON company_performance(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_model_performance_active ON model_performance(is_active, training_date DESC);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_daily_metrics_updated_at BEFORE UPDATE ON daily_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_analytics_updated_at BEFORE UPDATE ON skill_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_location_analytics_updated_at BEFORE UPDATE ON location_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_performance_updated_at BEFORE UPDATE ON company_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial data
INSERT INTO daily_metrics (date) VALUES (CURRENT_DATE) ON CONFLICT (date) DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pmis_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pmis_user;

COMMIT;
