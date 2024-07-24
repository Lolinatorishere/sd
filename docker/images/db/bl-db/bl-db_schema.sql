

CREATE TABLE IF NOT EXISTS public.districts(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crimes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id INT NOT NULL,
    case_number VARCHAR(255),
    crime_date TIMESTAMP,   
    block VARCHAR(255),
    iucr VARCHAR(10),
    primary_type VARCHAR(255),
    description VARCHAR(255),
    location_description VARCHAR(255),
    arrest BOOLEAN,
    domestic BOOLEAN,
    beat VARCHAR(10),
    district_id UUID,
    ward INTEGER,
    community_area INTEGER,
    fbi_code VARCHAR(10),
    x_coordinate INTEGER,
    y_coordinate INTEGER,
    year INTEGER,
    updated_on TIMESTAMP,
    latitude DECIMAL,
    longitude DECIMAL,
    FOREIGN KEY(district_id) REFERENCES districts(id)
);

INSERT INTO districts ( district ) VALUES ( 'test' );

