from flask import Flask, make_response, request
import csv
from uploader import Uploader
from representativenes import calc_repr
import psycopg2

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = '/tmp/'
app.config['ALLOWED_EXTENSIONS'] = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv'])

@app.route('/upload', methods=["POST"])
def upload_handler():
    u = Uploader()
    dataset = u.create_dataset()
    f = (dict(request.files)['f'])[0]
    u.upload_rows(f, dataset)
    return "uploaded"

@app.route('/metadata/<dataset_id>', methods=["GET"])
def metadata_handler(dataset_id):
    conn = psycopg2.connect("dbname='ip'")
    cur = self._conn.cursor()
    cur.exeute("SELECT zip, COUNT(*) FROM ")
    # zips = {94121 : (population, # ips)}
    r = calc_repr(zips)
    cur.execute("SELECT UNNEST(columns) FROM datasets WHERE id = {}".format(dataset_id)
    results = cur.fetchall()
    return flask.jsonify({representativenes: r, columns: results})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000, debug=True)
