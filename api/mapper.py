import psycopg2

class Mapper:
    def __init__(self):
        self._conn = psycopg2.connect("dbname='ip'")
        self._ipcache = {}

    def ip_to_zip(self, ip):
        """ Returns a zip code as a string or None if there is no zip
        code. We make no assertions about the format of `ip`.
        """

        if ip in self._ipcache:
            return self._ipcache[ip]
        
        cur = self._conn.cursor()
        cur.execute("SELECT zip FROM ip_to_zip WHERE ip >> inet '{}'".format(ip))
        results = cur.fetchall()
        if len(results) > 0:
            z = results[0][0]
            self._ipcache[ip] = z
            return z
        else:
            return None

    def zip_to_census_data(self, zip):
        cur = self._conn.cursor()
        cur.execute("""
        SELECT u.zip, u.unemp_rate, u.num_in_sample, p.population, p.land_sq_mi, p.density_per_sq_mile
        FROM unemployment u
        JOIN popdense p ON u.zip = p.zip
        WHERE u.zip = '{}'
        """.format(zip))
        results = cur.fetchall()
        if len(results) > 0:
            results = results[0]
            return {
                'zip': results[0],
                'unemployment_rate': results[1],
                'num_in_sample': results[2],
                'population': results[3],
                'land_sq_mi': results[4],
                'density_per_sq_mile': results[5]
               }
        else:
            print('no such data for zip', zip)
