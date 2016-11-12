import psycopg2

class Mapper:
    def __init__(self):
        self._conn = psycopg2.connect("dbname='ip'")

    def ip_to_zip(self, ip):
        """ Returns a zip code as a string or false if there is no zip
        code. We make no assertions about the format of `ip`.
        """
        cur = self._conn.cursor()
        cur.execute("SELECT zip FROM ip_to_zip WHERE ip >> inet '{}'".format(ip))
        results = cur.fetchall()
        if len(results) > 0:
            return results[0][0]
        else:
            return false

    def zip_to_census_data(self, zip):
        cur = self._conn.cursor()
        cur.execute("""
        SELECT u.*, p.*
        FROM unemployment u
        JOIN popdense p ON u.zip = p.zip
        WHERE u.zip = '{}'
        """.format(zip))
        results = cur.fetchall()
        return results[0]

m = Mapper()
