gunzip -ck GeoLite2-City-Blocks-IPv4.csv.gz > IP2Zip.csv
gunzip -ck hardcoded-dave-data.csv.gz > hardcoded_dave_data.csv
gunzip -ck zip2unemployment.csv.gz > zip2unemployment.csv
gunzip -ck zip2popdensity-area.csv.gz > zip2popdensity_area.csv

echo "
DROP DATABASE ip;
CREATE DATABASE ip;
" | psql postgres

echo "
CREATE TABLE ip_to_zip (
    ip inet,
    geoname_id int,
    registered_country_geoname_id int,
    represented_country_geoname_id int,
    is_anonymous_proxy boolean,
    is_satellite_provider boolean,
    zip text,
    latitude real,
    longitude real,
    accuracy_radius int
);

CREATE TABLE dave_data (
    ip inet,
    dictator_game real,
    prisoners_dilemma real,
    charitable_giving real,
    honesty real,
    punishment_of_selfish real,
    punishment_of_fairness real,
    impatience_time_discountin real,
    reflectiveness_correct_answers_on_crt real,
    big5_extraversion real,
    big5_agreeableness real,
    big5_conscientiousness real,
    big5_emotionalstability real,
    big5openness real,
    age int,
    female boolean,
    graduated_from_college boolean,
    income_over_35k boolean,
    passed_comprehension_questions boolean,
    risk_appetite real,
    trust real,
    support_for_rep1_vs_dem7 real,
    god real,
    log10_number_of_studies_completed real
);

CREATE TABLE unemployment (
    zip text,
    unemp_rate text,
    num_in_sample real
);

CREATE TABLE popdense (
    zip text,
    population int,
    land_sq_mi real,
    density_per_sq_mile real
);

CREATE TABLE datasets (
  id bigserial,
  columns text[] -- not including IP address
);

COPY ip_to_zip FROM '$PWD/IP2Zip.csv' DELIMITER ',' CSV HEADER;
COPY dave_data FROM '$PWD/hardcoded_dave_data.csv' DELIMITER ',' CSV HEADER;
COPY unemployment FROM '$PWD/zip2unemployment.csv' DELIMITER ',' CSV HEADER;
COPY popdense FROM '$PWD/zip2popdensity_area.csv' DELIMITER ',' CSV HEADER;
CREATE INDEX ON ip_to_zip USING gist (ip inet_ops);
CREATE INDEX ON ip_to_zip (zip);
CREATE INDEX ON popdense (zip);
CREATE INDEX ON unemployment (zip);
	" | psql ip

rm IP2Zip.csv
rm hardcoded_dave_data.csv
rm zip2unemployment.csv
rm zip2popdensity_area.csv
