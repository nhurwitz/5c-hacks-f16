import csv
from mapper import Mapper
import psycopg2

def lst2pgarr(alist):
    return '{' + ','.join(alist) + '}'

def merge_two_dicts(x, y):
    '''Given two dicts, merge them into a new dict as a shallow copy.'''
    z = x.copy()
    if y is not None:
        z.update(y)
    return z

class Uploader:
    def __init__(self):
        self._mapper = Mapper()
        self._conn = psycopg2.connect("dbname='ip'")

    def create_dataset(self):
        cur = self._conn.cursor()
        cur.execute("INSERT INTO datasets (columns) VALUES ('{}') RETURNING *")
        results = cur.fetchall()
        return results[0][0]

    def upload_rows(self, f, dataset_id):
        """ Takes in a file, returns an list of dicts, each row being a dict. """
        # return [self._augment_row(r) for r in csv.DictReader(f)]

        # TODO update columsn in datasets table for dataset id

        cur = self._conn.cursor()
        reader = csv.DictReader(f)
        first = reader.next() # get header line

        sanitize = lambda k: k.replace('(', '_').replace(')', '_').replace(' ', '_').replace('-', '_')
        cols = set(map(sanitize, first.keys()))
        cols.remove('ip_address')
        cols = sorted(list(cols))

        cur.execute("UPDATE datasets SET columns = '%s';" % (lst2pgarr(['ip_address'] + cols)))

        cur.execute("CREATE TABLE dataset_{} ({});".format(
            dataset_id,
            ", ".join(['ip_address inet'] + (map(lambda c: c + " double precision", cols)))
        ))

        for r in reader:
            cols_in_order = ['ip_address'] + cols
            r = dict([(sanitize(key), val) for (key, val) in r.items()])
            vals = map(lambda c: r[sanitize(c)], cols_in_order)
            vals[0] = "'" + vals[0] + "'"
            cur.execute("INSERT INTO dataset_{} ({}) VALUES ({});".format(
                dataset_id,
                ", ".join(cols_in_order),
                ", ".join(vals).replace(", ,", ", NULL,").replace(", ,", ", NULL,"),
            ))

        cur.execute("""
        CREATE VIEW dataset_view_{} AS (
            -- SELECT d.*, ip_to_zip.zip, u.unemp_rate, u.num_in_sample, p.population, p.land_sq_mi, p.density_per_sq_mile
            SELECT d.*, ip_to_zip.zip
            FROM dataset_{} d, ip_to_zip
            WHERE (
              ip_to_zip.ip >> d.ip_address::inet
            )
            -- LEFT JOIN unemployment u ON u.zip = ip_to_zip.zip
            -- LEFT JOIN popdense p ON u.zip = p.zip
        );
        CREATE INDEX ON dataset_{} USING gist ((ip_address::inet) inet_ops);
        """.format(dataset_id, dataset_id, dataset_id))
        self._conn.commit()

    def _augment_row(self, row):
        zip_code = self._mapper.ip_to_zip(row['ip_address'])
        if zip_code is None:
            return {}
        census_data = self._mapper.zip_to_census_data(zip_code)
        return merge_two_dicts(row, census_data)
