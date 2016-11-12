from flask import Flask, make_response, request
import csv
from uploader import Uploader

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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000, debug=True)
