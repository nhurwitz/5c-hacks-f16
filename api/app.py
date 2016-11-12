__author__ = 'shivendra'
from flask import Flask, make_response, request
import csv

app = Flask(__name__)

def transform(text_file_contents):
    return text_file_contents.replace("=", ",")


@app.route('/')
def form():
    return """
        <html>
            <body>
                <h1>Transform a file demo</h1>

                <form action="/upload" method="post" enctype="multipart/form-data">
                    <input type="file" name="data_file" />
                    <input type="submit" />
                </form>
            </body>
        </html>
    """

@app.route('/upload', methods=["POST"])
def transform_view():
    file = request.files['data_file']
    if not file:
        return "No file"

    file_contents = file.stream.read().decode("utf-8")
    csv_input = csv.reader(file_contents)
    row_count = sum(1 for row in csv_input)
    return str(row_count)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000, debug=True)