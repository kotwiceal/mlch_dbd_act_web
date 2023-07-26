"""This module implements a microcontroller wireless interface."""
import json, socket, requests, numpy

esp32_net_config = dict(host = '127.0.0.1', udp_port = 8080, http_port = 8090, 
    url_send = '/set-param', url_request = '/get-param')
esp32_data = dict(dac = dict(index = numpy.arange(16), value = numpy.random.randint(0, 4000, 16, dtype = int)),
        fm = dict(index = numpy.arange(16), value = numpy.random.randint(10, 80, 16, dtype = int)))

class NumpyEncoder(json.JSONEncoder):
    """Class to serialize ndarray object."""
    def default(self, obj):
        if isinstance(obj, numpy.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

class ESP32:
    """ESP32 network interface.
    
    net_config - dictionary of network configuration
    data - dictionary of remote server data
    """

    # default setting
    net_config_def = dict(host = '127.0.0.1', udp_port = 8080, http_port = 8090, 
        url_send = '/set-param', url_request = '/get-param')
    data_def = dict(dac = dict(index = numpy.arange(16), value = numpy.zeros(16, dtype = int)),
            fm = dict(index = numpy.arange(16), value = numpy.zeros(16, dtype = int)))
    
    def __init__(self, net_config = net_config_def, data = data_def) -> None:
        # assing network configuration
        self.net_config = net_config
        # assing default data
        self.data = data
        # bind keys of data
        self.unique_fields = set(self.data.keys())
        # create links
        self.udp_addr = (self.net_config['host'], self.net_config['udp_port'])
        self.url_send = f"http://{self.net_config['host']}:{self.net_config['http_port']}{self.net_config['url_send']}"
        self.url_request = f"http://{self.net_config['host']}:{self.net_config['http_port']}{self.net_config['url_request']}"
        # store a bool of success sending packet
        self.response = False
    
    def get_data(self, type: str):
        """Obtain data of specified notation."""
        match type:
            case 'np':
                return self.data
            case 'dict':
                return json.loads(json.dumps(self.data, cls = NumpyEncoder))
            case 'str':    
                return json.dumps(self.data, cls = NumpyEncoder)
    
    def update_data(self, data: dict) -> bool:
        """Overwrite data."""
        try:
            for key in data.keys():
                if key in self.unique_fields:
                    self.data[key]['value'][data[key]['index']] = data[key]['value']
            return True
        except Exception:
            return False
    
    def send(self, type: str, data: dict) -> bool:
        """Send packet to microcontroller."""
        status = self.update_data(data)
        if status:
            match type:
                case 'udp':
                    self._udp_send()
                    self.response = True
                case 'http':
                    self._http_send()
            return self.response 
          
    def request(self) -> dict:
        """Request packet from microcontroller."""
        try:
            response = requests.get(self.url_request)
            # check successes of request
            if (response.status_code == 200):              
                status = self.update_data(response.json())
                # check successes of data updating
                if status:
                    self.response = True
                    return self.get_data('dict'), self.response
                else:
                    raise Exception
            else:
                raise Exception
        except Exception:
            self.response = False
            return {}, self.response
        
    def _udp_send(self) -> None:
        """Send data via UDP socket."""
        try:
            message = bytes(self.get_data('str'), 'utf-8')
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.sendto(message, self.udp_addr)
            self.state_send = True
        except:
            self.state_send = False
    
    def _http_send(self) -> None:
        """Send data via HTTP."""
        try:
            response = requests.post(self.url_send, json = self.get_data('dict'))
            if (response.status_code == 200):
                self.response = True
            else:
                raise Exception
        except Exception:
            self.response = False