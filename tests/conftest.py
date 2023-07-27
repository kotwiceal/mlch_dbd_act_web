"""Pre-initialization module."""

import pytest
from src import app, esp32
from tests.net_emul import UDP_SERVER, HTTP_SERVER

"""Definition of fixtures."""

@pytest.fixture(scope = 'module')
def app_t():
    """Capture the app instance."""
    return app

@pytest.fixture(scope = 'module')
def client(app_t):
    """Capture the client instance."""
    return app_t.test_client()

@pytest.fixture(scope = 'module')
def mcu():
    """Capture the mcu instance."""
    return esp32

@pytest.fixture(scope = 'module')
def request_getparam_expected(mcu) -> dict:
    """Capture expected value at GET HTTP requesting."""
    return mcu.get_data('dict')

@pytest.fixture(scope = 'module')
def request_setparam_expected(mcu) -> dict:
    """Capture expected value at POST HTTP requesting."""
    return mcu.get_data('dict')

@pytest.fixture(scope = 'module')
def mcu_udp_server(mcu):
    """Create UDP server instance before tests"""
    # create UDS server instance
    udp_server = UDP_SERVER(mcu.net_config['host'], mcu.net_config['udp_port'])
    # launch the thread task
    udp_server.start()
    
    # go to tests
    yield udp_server
    
@pytest.fixture(scope = 'module')
def mcu_http_server(mcu):
    """Create HTTP server instance before tests, terminate after."""
    # create HTTP server instance
    http_server = HTTP_SERVER(mcu.net_config, mcu.get_data('dict'))
    # run the thread task
    http_server.start()
    
    # go to tests
    yield
    
    # terminate server
    http_server.terminate()
