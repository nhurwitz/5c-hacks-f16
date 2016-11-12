gunzip -ck GeoLite2-City-Blocks-IPv4.csv.gz > ../IP2Zip.csv
gunzip -ck hardcoded-dave-data.csv.gz > ../hardcoded_dave_data.csv
gunzip -ck zip2unemployment.csv.gz > ../zip2unemployment.csv
gunzip -ck zip2popdensity-area.csv.gz > ../zip2popdensity_area.csv
echo "
CREATE TABLE ip2Zip (ip reap ,geoname_id int,registered_country_geoname_id int,represented_country_geoname_id int,is_anonymous_proxy int,is_satellite_provider int,zip real,latitude real,longitude real,accuracy_radius int);
.mode csv
.import ../IP2Zip.csv ip2Zip
CREATE TABLE dave_data (ip real,DictatorGame real,PrisonersDilemma real,CharitableGiving real,Honesty real,PunishmentOfSelfish real,PunishmentOfFairness real,Impatience_time_discountin real,reflectiveness_correct_answers_on_CRT real,big5_extraversion real,big5_agreeableness real,big5_conscientiousness real,big5_emotionalstability real,big5openness real,age real,female real,graduated_from_college,income_over_35k real,passed_comprehension_questions real,risk_appetite real,trust real,Support_for_Rep1_vs_Dem7,god real,log10_number_of_studies_completed real);
.import ../hardcoded_dave_data.csv dave_data
CREATE TABLE unemployment (zip real,unemp_rate text,num_in_sample real);
.import ../zip2unemployment.csv unemployment
CREATE TABLE popdense (zip real,population real,land_sq_mi real,density_per_sq_mile real);
.import ../zip2popdensity_area.csv popdense
	" | sqlite3 data.db
rm ../IP2Zip.csv
rm ../hardcoded_dave_data.csv
rm ../zip2unemployment.csv
rm ../zip2popdensity_area.csv
