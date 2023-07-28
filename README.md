# Description
`Flask` application presents a single page GUI interface to provide JSON requesting to UDP and HTTP servers hosted by [ESP32](https://github.com/kotwiceal/mlch_dbd_act_pio_esp32) microcontroller. Simple web design was performed by exploiting `jQuery`, `webpack` and `Bootstrap` technologies. 

### Communication graph
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant MCU
    autonumber
    critical request data from MCU
        Client->>Server: HTTP GET request
        Note over Client, Server: http://srvhost:srvport/get-param
        Server->>MCU: HTTP GET request
        Note over Server, MCU: http://mcuhost:mcuport/get-param
        MCU->>Server: HTTP GET response
        Note over Server, MCU: http://mcuhost:mcuport/get-param <br> json = {'dac': {'value': array(16)},<br> 'fm': {'value': array(16)}}
        Server->>Client: HTTP GET response
        Note over Client, Server: http://srvhost:srvport/get-param <br> json = {'dac': {'value': array(16)},<br> 'fm': {'value': array(16)}}
    end
    critical send data to MCU
        alt {'type': 'http'}
            Client->>Server: HTTP POST request
            Note over Client, Server: http://srvhost:srvport/set-param <br> json = {'type': 'http', 'data': {'dac': {<br> 'value': array(n), 'index': array(n)},<br> 'fm': {'value': array(m), <br>'index': array(m)}}}
            Server->>MCU: HTTP POST request
            Note over Server, MCU: http://mcuhost:mcuport/set-param <br> json = {'dac': {<br> 'value': array(n), 'index': array(n)},<br> 'fm': {'value': array(m), <br>'index': array(m)}}
            MCU->>Server: HTTP POST response
            Note over Server, MCU: http://mcuhost:mcuport/set-param
            Server->>Client: HTTP POST response
            Note over Client, Server: http://srvhost:srvport/set-param
        else {'type': 'udp'}
            Client->>Server: HTTP POST request
            Note over Client, Server: http://srvhost:srvport/set-param <br> json = {'type': 'udp', 'data': {'dac': {<br> 'value': array(n), 'index': array(n)},<br> 'fm': {'value': array(m), <br>'index': array(m)}}}
            Server->>MCU: UDP send
            Note over Server, MCU: mcuhost:mcuportudp <br> json = {'dac': {<br> 'value': array(n), 'index': array(n)},<br> 'fm': {'value': array(m), <br>'index': array(m)}}
        end
    end
```

### Preview
![preview](preview.gif)

### Preparing to run project
1.  Install `Python` dependencies by means `poetry` package manager:
	`poetry shell`
	`poetry update`
2.  Install `JavaScript` frameworks by means `npm` package manager:
	`cd src/static`
	`npm update`
3.  Launch the application:
	`cd ../..`
	`python run.py`
****