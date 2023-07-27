"""Testing module of various communication methods with MCU."""

import json, requests
    
"""Define test tasks.
"""

def test_request_getparam(client, mcu_http_server, request_getparam_expected):
    """Test requesting data from microcontroller by means client GET HTTP request."""
    # GIVEN initialized HTTP server
    # WHEN request the server in order to obtain data
    # THEN compare received data with those that the server had been initialized
    
    # request GET HTTP by client
    response = client.get('/get-param')
    
    # check status code of response
    assert response.status_code == 200
    
    # compare result and expected value
    assert json.loads(response.data) == request_getparam_expected

def test_request_setparam_udp(client, mcu_udp_server, request_setparam_expected):  
    """Test UDP socket JSON-packet sending by means client POST HTTP request."""
    # GIVEN initialized UDP server
    # WHEN send JSON data in order to the server
    # THEN compare send JSON data with those that the server received
    
    # request POST HTTP by client
    response = client.post('/set-param', json = dict(type = 'udp', data = request_setparam_expected))
    
    # check status code of response
    assert response.status_code == 200
    
    # wait the received packet by remote UDP server (mcu_udp_server)
    mcu_udp_server.join()
    # get results from queue
    result = mcu_udp_server.get()

    # compare result and expected value
    assert result == request_setparam_expected

def test_request_setparam_http(client, mcu, mcu_http_server, request_setparam_expected):     
    """Test requesting data from microcontroller by means client GET HTTP request."""
    # GIVEN initialized HTTP server
    # WHEN send JSON data in order to the server
    # THEN compare send JSON data with those that the server received
    
    # request POST HTTP by client
    response = client.post('/set-param', json = dict(type = 'http', data = request_setparam_expected))
    
    # check status code of response
    assert response.status_code == 200
    
    # request HTTP GET to pull data from remote server (mcu_http_server)
    response_http_server = requests.get(mcu.url_request)
    # check status code of response_http_server
    assert response_http_server.status_code == 200
    
    # compare result and expected value
    assert request_setparam_expected == response_http_server.json()
    

    