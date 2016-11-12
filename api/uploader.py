import csv

def merge_two_dicts(x, y):
    '''Given two dicts, merge them into a new dict as a shallow copy.'''
    z = x.copy()
    z.update(y)
    return z

class Uploader:
    def __init__(self):
        self._mapper = Mapper()

    def read_rows(self, f):
        """ Takes in a file, returns an list of dicts, each row being a dict. """
        return [self._augment_row(r) for r in csv.DictReader(f)]

    def _augment_row(self, row):
        zip_code = self._mapper.ip_to_zip(row['ip_address'])
        census_data = self._mapper.zip_to_census_data(zip_code)
        return merge_two_dicts(row, census_data)
