"""This module implements a server handler functional.
Return: modified flask instance
"""
# load app instance
from src import app, esp32
# load suppoting functional
from flask import Response, request

@app.route('/')
def index():
    """Assign enter point."""
    data, status = esp32.request()
    return app.send_static_file('./dist/main.html')

@app.route('/<path:path>')
def route_static_file(path):
    """Route static files located in `static_url_path`"""
    return app.send_static_file('./dist/' + path)

@app.route('/set-param', methods = ['POST'])
def set_param():
    """Send JSON data from client to microcontroller."""
    response = request.get_json()
    status = esp32.send(response['type'], response['data'])
    return Response(status = 200 if status else 500)

@app.route('/get-param', methods = ['GET'])
def get_param():
    """Send JSON data from microcontroller to client."""
    # data = esp32.get_data('dict') # to bypass requesting
    data, status = esp32.request()
    return data