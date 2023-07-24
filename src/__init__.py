"""This package implements HTTP server hosted by flask framework.
Return: modified flask instance
"""

from flask import Flask

# create flask instance with indication path of static files (scr/static)
app = Flask(__name__, static_url_path = '/static')