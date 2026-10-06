-- ====================================================================
-- AETHERA TRAVEL APPLICATION — DATABASE SCHEMA
-- Relational model matching the multi-destination journey planner.
-- Target Database: PostgreSQL (or standard ANSI SQL compliant)
-- ====================================================================

-- Enable UUID extension for auto-generating secure IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. DESTINATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE destinations (
    city VARCHAR(100) PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    x_percent INT CHECK (x_percent BETWEEN 0 AND 100),
    y_percent INT CHECK (y_percent BETWEEN 0 AND 100),
    recommended_duration INT NOT NULL DEFAULT 3,
    budget_level VARCHAR(3) CHECK (budget_level IN ('$', '$$', '$$$')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 2. DESTINATION ATTRACTIONS (One-to-Many)
-- --------------------------------------------------------------------
CREATE TABLE destination_attractions (
    id SERIAL PRIMARY KEY,
    destination_city VARCHAR(100) REFERENCES destinations(city) ON DELETE CASCADE,
    attraction_name VARCHAR(255) NOT NULL,
    UNIQUE(destination_city, attraction_name)
);

-- --------------------------------------------------------------------
-- 3. DESTINATION ACTIVITIES (One-to-Many)
-- --------------------------------------------------------------------
CREATE TABLE destination_activities (
    id SERIAL PRIMARY KEY,
    destination_city VARCHAR(100) REFERENCES destinations(city) ON DELETE CASCADE,
    activity_name VARCHAR(255) NOT NULL,
    UNIQUE(destination_city, activity_name)
);

-- --------------------------------------------------------------------
-- 4. ACTIVITY STYLES MATCHING (Many-to-Many)
-- Links activities to travel styles (e.g. relaxed, food, heritage, adventure)
-- --------------------------------------------------------------------
CREATE TABLE activity_styles (
    activity_id INT REFERENCES destination_activities(id) ON DELETE CASCADE,
    style_tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (activity_id, style_tag)
);

-- --------------------------------------------------------------------
-- 5. JOURNEYS TABLE
-- Stores main journey details and general configurations
-- --------------------------------------------------------------------
CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_label VARCHAR(255) NOT NULL, -- e.g. "MUMBAI · GOA · JAIPUR"
    budget_amount INT,
    budget_label VARCHAR(50) NOT NULL,        -- e.g. "₹1,00,000"
    travelers_count INT NOT NULL DEFAULT 1,
    adults_count INT NOT NULL DEFAULT 1,
    children_count INT NOT NULL DEFAULT 0,
    style_label VARCHAR(255) NOT NULL,        -- e.g. "Culture · Food · Relaxed"
    status VARCHAR(20) NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'Upcoming', 'Completed')),
    start_date DATE,
    end_date DATE,
    dates_decided BOOLEAN NOT NULL DEFAULT FALSE,
    pace VARCHAR(20) NOT NULL DEFAULT 'balanced' CHECK (pace IN ('slow', 'balanced', 'packed')),
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 6. JOURNEY DESTINATIONS SEQUENCE (Join Table)
-- Stores the ordered destinations associated with a journey
-- --------------------------------------------------------------------
CREATE TABLE journey_destinations (
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    destination_city VARCHAR(100) REFERENCES destinations(city) ON DELETE RESTRICT,
    position_order INT NOT NULL,
    PRIMARY KEY (journey_id, position_order)
);

-- --------------------------------------------------------------------
-- 7. JOURNEY ITINERARY DAYS
-- Stores daily entries for itineraries
-- --------------------------------------------------------------------
CREATE TABLE journey_itinerary_days (
    id SERIAL PRIMARY KEY,
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    date_label VARCHAR(50) NOT NULL, -- e.g. "12 Jun" or "Day 1"
    city VARCHAR(100) NOT NULL,
    UNIQUE(journey_id, day_number)
);

-- --------------------------------------------------------------------
-- 8. JOURNEY DAY ACTIVITIES
-- Stores actual activities belonging to each day (allows custom additions/reordering)
-- --------------------------------------------------------------------
CREATE TABLE journey_day_activities (
    id SERIAL PRIMARY KEY,
    itinerary_day_id INT REFERENCES journey_itinerary_days(id) ON DELETE CASCADE,
    activity_text TEXT NOT NULL,
    position_order INT NOT NULL
);

-- --------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- --------------------------------------------------------------------
CREATE INDEX idx_destinations_geo ON destinations(city, region, country);
CREATE INDEX idx_journey_destinations_search ON journey_destinations(journey_id);
CREATE INDEX idx_journey_itinerary_days_search ON journey_itinerary_days(journey_id);
CREATE INDEX idx_journey_day_activities_search ON journey_day_activities(itinerary_day_id);

-- ====================================================================
-- SEED DATA — SEEDING PRECONFIGURED DESTINATIONS
-- ====================================================================

-- Seeding Destinations
INSERT INTO destinations (city, region, country, image_url, latitude, longitude, x_percent, y_percent, recommended_duration, budget_level) VALUES
('Mumbai', 'Maharashtra', 'India', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop', 18.9220, 72.8347, 28, 48, 3, '$$$'),
('Goa', 'Goa', 'India', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop', 15.2993, 74.1240, 32, 68, 4, '$$'),
('Jaipur', 'Rajasthan', 'India', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop', 26.9124, 75.7873, 35, 28, 3, '$$'),
('Delhi', 'Delhi NCR', 'India', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop', 28.6139, 77.2090, 42, 20, 3, '$$'),
('Kerala', 'Kerala', 'India', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop', 9.9312, 76.2673, 55, 88, 4, '$$'),
('Bengaluru', 'Karnataka', 'India', 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop', 12.9716, 77.5946, 50, 78, 2, '$$$'),
('Srinagar', 'Jammu & Kashmir', 'India', 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?q=80&w=800&auto=format&fit=crop', 34.0837, 74.7973, 38, 10, 4, '$$$'),
('Udaipur', 'Rajasthan', 'India', 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop', 24.5854, 73.7125, 31, 35, 3, '$$$');

-- Seeding Attractions
INSERT INTO destination_attractions (destination_city, attraction_name) VALUES
('Mumbai', 'Gateway of India'),
('Mumbai', 'Marine Drive Promenade'),
('Mumbai', 'Kala Ghoda Art Precinct'),
('Mumbai', 'Colaba Causeway'),
('Mumbai', 'Chhatrapati Shivaji Terminus'),
('Goa', 'Basilica of Bom Jesus'),
('Goa', 'Anjuna Flea Market'),
('Goa', 'Dudhsagar Waterfalls'),
('Goa', 'Fontainhas Latin Quarter'),
('Goa', 'Palolem Beach Coves'),
('Jaipur', 'Amber Fort'),
('Jaipur', 'Hawa Mahal Palace of Winds'),
('Jaipur', 'City Palace Museum'),
('Jaipur', 'Jantar Mantar Observatory'),
('Jaipur', 'Patrika Gate'),
('Delhi', 'Humayun’s Tomb'),
('Delhi', 'Qutub Minar Complex'),
('Delhi', 'Red Fort'),
('Delhi', 'India Gate'),
('Delhi', 'Lodhi Art District'),
('Kerala', 'Fort Kochi Chinese Fishing Nets'),
('Kerala', 'Munnar Tea Estates'),
('Kerala', 'Alleppey Backwaters'),
('Kerala', 'Periyar Wildlife Sanctuary'),
('Bengaluru', 'Bangalore Palace'),
('Bengaluru', 'Cubbon Park Botanical Sanctuary'),
('Bengaluru', 'Lalbagh Glass House'),
('Bengaluru', 'Nandi Hills Summit'),
('Srinagar', 'Dal Lake Houseboats'),
('Srinagar', 'Shalimar Bagh Mughal Gardens'),
('Srinagar', 'Nishat Bagh'),
('Srinagar', 'Gulmarg Meadow of Flowers'),
('Udaipur', 'Udaipur City Palace'),
('Udaipur', 'Lake Pichola & Lake Palace'),
('Udaipur', 'Sajjangarh Monsoon Palace'),
('Udaipur', 'Jag Mandir Island');

-- Seeding Activities
INSERT INTO destination_activities (id, destination_city, activity_name) VALUES
(1, 'Mumbai', 'Heritage architectural walk in Colaba'),
(2, 'Mumbai', 'Late-night street food crawl at Chowpatty'),
(3, 'Mumbai', 'Sunset drive along the Bandra-Worli Sea Link'),
(4, 'Mumbai', 'Art gallery hopping in Fort & Kala Ghoda'),
(5, 'Mumbai', 'Early morning harbor boat excursion'),
(6, 'Goa', 'Private sunset catamaran sail'),
(7, 'Goa', 'Heritage walking tour in Old Goa & Fontainhas'),
(8, 'Goa', 'Organic spice plantation tour & lunch'),
(9, 'Goa', 'Scuba diving & water sports at Grande Island'),
(10, 'Goa', 'Ayurvedic wellness massage & yoga session'),
(11, 'Jaipur', 'Golden hour photography at Hawa Mahal'),
(12, 'Jaipur', 'Jeep safari & fort exploration at Amber Fort'),
(13, 'Jaipur', 'Traditional Rajasthani Thali culinary tasting'),
(14, 'Jaipur', 'Bazaar walking tour for block-printed textiles'),
(15, 'Jaipur', 'Stargazing dinner at Nahargarh Fort overlooking city'),
(16, 'Delhi', 'Old Delhi street food tour by cycle rickshaw'),
(17, 'Delhi', 'Guided history walk at Humayun’s Tomb gardens'),
(18, 'Delhi', 'Murals and street art photo walk in Lodhi District'),
(19, 'Delhi', 'Fine-dining luxury experience in Chanakyapuri'),
(20, 'Delhi', 'Shopping for Indian handicrafts at Dilli Haat'),
(21, 'Kerala', 'Overnight luxury houseboat cruise in Alleppey'),
(22, 'Kerala', 'Ayurvedic rejuvenation massage & spa treatment'),
(23, 'Kerala', 'Traditional Kathakali theater performance'),
(24, 'Kerala', 'Misty sunrise hike in Munnar tea plantations'),
(25, 'Kerala', 'Fort Kochi history & colonial harbor walk'),
(26, 'Bengaluru', 'Craft microbrewery hopping in Indiranagar'),
(27, 'Bengaluru', 'Early morning coffee & cycling in Cubbon Park'),
(28, 'Bengaluru', 'Palace architectural tour & history walk'),
(29, 'Bengaluru', 'Sunrise excursion climb up Nandi Hills'),
(30, 'Srinagar', 'Sunrise Shikara boat ride on Dal Lake'),
(31, 'Srinagar', 'Overnight stay in a cedarwood luxury houseboat'),
(32, 'Srinagar', 'Guided alpine flora walk in Shalimar Gardens'),
(33, 'Srinagar', 'High-altitude Gondola cable car ride in Gulmarg'),
(34, 'Udaipur', 'Lakeside sunset cruise on Lake Pichola'),
(35, 'Udaipur', 'Traditional Dharohar folk puppet & music show'),
(36, 'Udaipur', 'Fine dining lakeside rooftop overlooking the palace'),
(37, 'Udaipur', 'Hillside drive to Sajjangarh Monsoon Palace');

-- Seeding Activity Style Mappings
INSERT INTO activity_styles (activity_id, style_tag) VALUES
(1, 'heritage'), (1, 'culture'), (1, 'photography'),
(2, 'food'), (2, 'relaxed'),
(3, 'relaxed'), (3, 'photography'),
(4, 'culture'), (4, 'luxury'),
(5, 'adventure'), (5, 'nature'),
(6, 'luxury'), (6, 'relaxed'), (6, 'photography'),
(7, 'heritage'), (7, 'culture'),
(8, 'nature'), (8, 'food'), (8, 'relaxed'),
(9, 'adventure'),
(10, 'wellness'), (10, 'relaxed'),
(11, 'photography'), (11, 'culture'),
(12, 'adventure'), (12, 'heritage'),
(13, 'food'), (13, 'culture'),
(14, 'budget'), (14, 'culture'),
(15, 'luxury'), (15, 'relaxed'),
(16, 'food'), (16, 'culture'), (16, 'budget'),
(17, 'heritage'), (17, 'culture'), (17, 'photography'),
(18, 'photography'), (18, 'culture'),
(19, 'luxury'), (19, 'food'),
(20, 'budget'), (20, 'culture'),
(21, 'relaxed'), (21, 'nature'), (21, 'luxury'),
(22, 'wellness'), (22, 'relaxed'),
(23, 'culture'), (23, 'heritage'),
(24, 'nature'), (24, 'adventure'), (24, 'photography'),
(25, 'heritage'), (25, 'culture'),
(26, 'nightlife'), (26, 'food'),
(27, 'nature'), (27, 'relaxed'),
(28, 'heritage'), (28, 'culture'),
(29, 'adventure'), (29, 'photography'),
(30, 'relaxed'), (30, 'photography'), (30, 'nature'),
(31, 'luxury'), (31, 'relaxed'),
(32, 'nature'), (32, 'wellness'),
(33, 'adventure'), (33, 'nature'),
(34, 'relaxed'), (34, 'luxury'), (34, 'photography'),
(35, 'culture'), (35, 'heritage'),
(36, 'food'), (36, 'luxury'),
(37, 'adventure'), (37, 'nature');

-- --------------------------------------------------------------------
-- 9. TRANSIT BOOKINGS TABLE (Train & Bus bookings)
-- Holds booking tickets, carrier info, PNR details, and scheduled times
-- --------------------------------------------------------------------
CREATE TABLE transit_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    booking_type VARCHAR(10) CHECK (booking_type IN ('TRAIN', 'BUS')) NOT NULL,
    pnr_number VARCHAR(50) NOT NULL, -- Passenger Name Record / Reference Number
    operator_name VARCHAR(100) NOT NULL, -- e.g., "Indian Railways", "Vande Bharat Express", "KSRTC"
    service_number VARCHAR(50) NOT NULL,  -- Train/Bus Service Number (e.g., "22223")
    departure_location VARCHAR(150) NOT NULL,
    arrival_location VARCHAR(150) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    class_code VARCHAR(30) NOT NULL, -- e.g., "AC Chair Car (CC)", "AC Sleeper (2A)", "Scania Multi-Axle AC"
    coach_number VARCHAR(10),       -- Coach/Platform indicator (e.g., "C3")
    seat_numbers VARCHAR(100),       -- Comma-separated seat layout (e.g., "12, 14")
    ticket_status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (ticket_status IN ('CONFIRMED', 'RAC', 'WAITLISTED', 'CANCELLED')),
    fare_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for speedy booking retrieval relative to journey
CREATE INDEX idx_transit_bookings_journey ON transit_bookings(journey_id);

