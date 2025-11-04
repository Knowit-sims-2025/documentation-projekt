-- RESETTA HELA SCHEMAT
BEGIN;

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- ======= SCHEMA =======

CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    confluence_author_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    total_points INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lifetime_points INTEGER DEFAULT 0
);

-- Tabell för att lagra team.
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kopplingstabell för att hantera medlemskap i team (many-to-many).
CREATE TABLE user_teams (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, team_id)
);

-- Tabell för att lagra stats för en viss user
CREATE TABLE user_stats (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_comments INTEGER DEFAULT 0,
    total_created_pages INTEGER DEFAULT 0,
    total_edits_made INTEGER DEFAULT 0,
    total_resolved_comments INTEGER DEFAULT 0
);

-- Tabell för att logga alla aktiviteter som ger poäng.
-- Detta är "kvittot" för varje poäng som delas ut.
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    confluence_page_id VARCHAR(255) NOT NULL,
    confluence_version_number INTEGER NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    points_awarded INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (confluence_page_id, confluence_version_number)
);

-- Tabell som definierar alla tillgängliga badges.
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    criteria_value INTEGER NOT NULL
    criteria_type VARCHAR(50) NOT NULL 
);

-- Kopplingstabell för badges per användare (+ progress)
CREATE TABLE user_badges (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    progress INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, badge_id)
);

-- Tabell för att lagra information om tävlingar.
CREATE TABLE competitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date   TIMESTAMPTZ NOT NULL,
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för att snabba på vanliga sökningar.
CREATE INDEX idx_users_confluence_id ON users(confluence_author_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);

COMMIT;
