"""This package implements HTTP server hosted by flask framework.
Return: modified flask instance
"""

from flask import Flask
from src import devices

# create MCU instance
esp32 = devices.ESP32(devices.esp32_net_config, devices.esp32_data)

# create flask instance with indication path of static files (scr/static)
app = Flask(__name__, static_url_path = '/static')

# import handlers
from src import views