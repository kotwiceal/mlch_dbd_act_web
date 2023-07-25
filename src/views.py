"""This module implements a server handler functional.
Return: modified flask instance
"""
# load app instance
from src import app
# load suppoting functional
from flask import Response

@app.route('/')
def index():
    """Assign enter point."""
    return Response(status = 200)

@app.route('/<path:path>')
def route_static_file(path):
    """Route static files located in `static_url_path`"""
    return app.send_static_file(path)

@app.route('/set-param', methods = ['POST'])
def set_param():
    """Send JSON data from client to microcontroller."""
    return Response(status = 200)

@app.route('/get-param', methods = ['GET'])
def get_param():
    """Send JSON data from microcontroller to client."""
    return Response(status = 200)