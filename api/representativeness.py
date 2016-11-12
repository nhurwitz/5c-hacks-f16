from __future__ import division
from scipy.stats import entropy

# takes dictionary from zipcode to population count, ip count tuple
def calc_repr(zip_codes):
    P, Q = zip(*zip_codes.values())
    P_normal = [(p + 1) / (sum(P) + len(zip_codes)) for p in P]
    Q_normal = [(q + 1) / (sum(Q) + len(zip_codes)) for q in Q]
    return 1 / (entropy(P_normal, Q_normal) + 1)
