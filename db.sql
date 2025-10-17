-- Stäng alla aktiva sessioner mot mål-databasen (annars blockeras DROP DATABASE)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = :'DB_NAME'
  AND pid <> pg_backend_pid();

-- Droppa och återskapa databasen
DROP DATABASE IF EXISTS :DB_NAME;
CREATE DATABASE :DB_NAME OWNER :DB_OWNER TEMPLATE template0 ENCODING 'UTF8';

CREATE TABLE users (
    id SERIAL PRIMARY KEY, -- Unikt internt ID för användaren
    confluence_author_id VARCHAR(255) UNIQUE NOT NULL, -- Användarens unika ID från Confluence API
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT, -- URL till användarens profilbild
    total_points INTEGER DEFAULT 0,
    -- NYTT: Kolumn för att hantera admin-rättigheter.
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabell för att lagra team.
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kopplingstabell för att hantera medlemskap i team (many-to-many).
CREATE TABLE user_teams (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, team_id)
);

-- Tabell för att logga alla aktiviteter som ger poäng.
-- Detta är "kvittot" för varje poäng som delas ut.
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    confluence_page_id VARCHAR(255) NOT NULL,
    confluence_version_number INTEGER NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- t.ex. 'PAGE_CREATED', 'PAGE_UPDATED'
    points_awarded INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (confluence_page_id, confluence_version_number)
);

-- Tabell som definierar alla tillgängliga badges.
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    criteria_value INTEGER NOT NULL
);

CREATE TYPE claim_status_enum AS ENUM ('CLAIMED', 'UNCLAIMED');
-- Kopplingstabell för att hålla koll på vilka badges en användare har förtjänat.
CREATE TABLE user_badges (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER NOT NULL DEFAULT 0,
    claim_status ENUM('CLAIMED', 'UNCLAIMED') NOT NULL DEFAULT 'UNCLAIMED',
    PRIMARY KEY (user_id, badge_id)
);

-- NYTT: Tabell för att lagra information om tävlingar.
CREATE TABLE competitions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    -- Håller koll på vilken admin som skapade tävlingen.
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Index för att snabba på vanliga sökningar.
CREATE INDEX idx_users_confluence_id ON users(confluence_author_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
