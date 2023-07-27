"""Module presents supporting classes to emulate external UDP and HTTP servers.
"""

from queue import Queue
from threading import Thread
import json, socket
from http.server import BaseHTTPRequestHandler, HTTPServer

class UDP_SERVER(Thread):
    """Class implements a single thread event-loop UDP server to test package receiving 
        from client by one connection session.
    """
    def __init__(self, host: str, port: int) -> None:
        self.queue = Queue()
        self.host = host
        self.port = port
        self.buffsize = 1024
        # create UDP socket server
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind((self.host, self.port))
        super().__init__()
        
    def run(self) -> None:      
        """Call function by separate thread."""
        data = {}
        while True:
            data, _ = self.sock.recvfrom(self.buffsize)
            break
        self.queue.put(json.loads(data))
        
    # return receiving packet from queue
    def get(self) -> dict:
        return self.queue.get()
    
class HTTP_SERVER(Thread):
    """Class implements a single thread event-loop HTTP server to test package receiving and sending.
    """
    def __init__(self, net_config: dict, data: dict) -> None:
        self.net_config = net_config
        self.data = data
        self.server = HTTPServer((self.net_config['host'], self.net_config['http_port']), HTTP_Handler)
        self.server.data = self.data
        self.server.url_send = net_config['url_send']
        self.server.url_request = net_config['url_request']
        super().__init__()
        
    def terminate(self):
        self.server.shutdown()
        
    def run(self):
        """Call function by separate thread."""
        self.server.serve_forever()

class HTTP_Handler(BaseHTTPRequestHandler): 
    """Modified standard handler of HTTP server in order to handler specified paths and 
        exchange data between client and server.  
    """    
    def do_GET(self):
        match self.path:
            case self.server.url_request:
                self.send_response(200)
                self.send_header('Content-type','application/json')
                self.end_headers()
                message = json.dumps(self.server.data)        
                self.wfile.write(bytes(message, 'utf8'))
        
    def do_POST(self):
        match self.path:
            case self.server.url_send:
                content_length = int(self.headers['Content-Length'])
                serialized_data = self.rfile.read(content_length)
                try:
                    self.server.data = json.loads(serialized_data)
                    self.send_response(200)
                except:
                    self.send_response(500)
                self.send_header('Content-type','plain/text')
                self.end_headers()
                