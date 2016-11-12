gunzip -ck GeoLite2-City-Blocks-IPv4.csv.gz > ../IP2Zip.csv
gunzip -ck hardcoded-dave-data.csv.gz > ../hardcoded_dave_data.csv
gunzip -ck zip2unemployment.csv.gz > ../zip2unemployment.csv
gunzip -ck zip2popdensity-area.csv.gz > ../zip2popdensity_area.csv
echo "
CREATE TABLE ip2Zip (network reap ,geoname_id int,registered_country_geoname_id int,represented_country_geoname_id int,is_anonymous_proxy int,is_satellite_provider int,postal_code real,latitude real,longitude real,accuracy_radius int);
.mode csv
.import ../IP2Zip.csv ip2Zip
CREATE TABLE dave_data (IPAddress real,DictatorGame real,PrisonersDilemma real,CharitableGiving real,Honesty real,PunishmentOfSelfish real,PunishmentOfFairness real,Impatience_time_discountin real,reflectiveness_correct_answers_on_CRT real,big5_extraversion real,big5_agreeableness real,big5_conscientiousness real,big5_emotionalstability real,big5openness real,age real,female real,graduated_from_college,income_over_35k real,passed_comprehension_questions real,risk_appetite real,trust real,Support_for_Rep1_vs_Dem7,god real,log10_number_of_studies_completed real);
.import ../hardcoded_dave_data.csv dave_data
CREATE TABLE unemployment (Zip real,UnempRate text,NumInSample real);
.import ../zip2unemployment.csv unemployment
CREATE TABLE popdense (Zip real,Pop2010 real,Land_Sq_Mi real,Density_Per_Sq_Mile real);
.import ../zip2popdensity_area.csv popdense
	" | sqlite3 data.db
rm ../IP2Zip.csv
rm ../hardcoded_dave_data.csv
rm ../zip2unemployment.csv
rm ../zip2popdensity_area.csv
