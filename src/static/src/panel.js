/**
 * @brief Card pattern to content another elements 
 */
class Card {
    /**
     * @param header label of card 
     */
    constructor(header) {
        this.header = header;
        this.card = $('<div></div>').addClass('card')
        this.card_header = $('<h6></h6>').addClass('card-header text-center').append(this.header)
        this.card_body = $('<div></div>').addClass('card-body')
        this.card.append(this.card_header, this.card_body)

        // difine export jquery object
        this.children = this.card
    }

    /**
     * Append to card body
     * @param body appended object 
     */
    append(body) {
        this.card_body.append(body)
    }
}

/**
 * @brief Input pattern to track passed values
 * @param parent JQuery instance
 * @param parameter object 
 * @example parameter = {label: 'Index', key: 'index', dim: 16, initial: [0, 1, 2, 3], limit: [0, 15]}
 */
class Input {
    constructor(parent, parameter) {
        this.parent = parent; this.parameter = parameter; this.state = false; this.key = this.parameter.key;

        this.input_group = $('<div></div>').addClass('input-group mt-2')        
        this.input_label = $('<div></div>').addClass('input-group-prepend').append($('<span></span>').addClass('input-group-text').append(this.parameter.label))
        this.input = $('<input>').attr('type', 'text').addClass('form-control').on('blur', () => {this.change()}).val(JSON.stringify(this.parameter.initial))
            .on('input', () => {this.change()})

        this.input_group.append([this.input_label, this.input])
        this.parent.append(this.input_group)

        // initialte state
        this.check()

        // difine export jquery object
        this.children = this.input_group
    }

    /**
     * Trigger functnio at updating input state
     */
    change() {
        this.check()
        this.event()
    }

    /**
     * Event functnio at updating input state
     */
    event() {}

    /**
     * Get input value
     * @returns input value
     */
    get() {
        let result = []
        try {
            result = JSON.parse(this.input.val())
        }
        catch {
        }
        return result
    }

    /**
     * Checking of value correction in field: array size and belonging value of each element to range
     */
    check() {
        let line = this.input.val()
        if (this.isValidJsonString(line)) {
            let object = JSON.parse(line) 
            if (typeof object == 'number' && this.parameter.dim == 1) {
                this.state = true
            }
            else {
                if (object.length <= this.parameter.dim) {
                    for (let index in object) {
                        let value = object[index]
                        this.state = (!isNaN(value)) ? ((value >= this.parameter.limit[0] && value <= this.parameter.limit[1]) ? true : false) : false
                    }
                } else {
                    this.state = false
                }
            }
        } else {
            this.state = false
        }
        
        this.update(this.state)
    }

    /**
     * Check JSON string notation 
     * @param jsonString - examed string
     */
    isValidJsonString(jsonString) {    
        if(!(jsonString && typeof jsonString === 'string')) {
            return false
        }    
        try {
            JSON.parse(jsonString);
            return true
        } catch(error) {
            return false
        }    
    }

    /**
     * Update input style
     */
    update (state) {
        state ? this.input.removeClass('is-invalid').addClass('is-valid') : this.input.removeClass('is-valid').addClass('is-invalid')
    }
}

/**
 * @brief Column pattern to content another elements
 */
class Column {
    constructor () {
        this.div_container = $('<div></div>').addClass('container mt-4')
        this.div_row = $('<div></div>').addClass('row')
        this.div_container.append(this.div_row)

        // difine export jquery object
        this.children = this.div_container
    }
    /**
     * @brief Append elements to Column body
     * @param element JQuery instance
     */
    append(element) {
        this.div_row.append($('<div></div>').addClass('col-sm').append(element))
    }
}

/**
 * @brief Item pattern to perform specified server request
 * @param parameter object with field: label is card header, inputs - is array of objects containting array of size and element range
 * @example parameter = {label: 'Voltage', ''key: 'dac', inputs: [{label: 'Index', key: 'index', initial: [0, 1, 2, 3], dim: 16, limit: [0, 15]},
 *      {label: 'Index', key: 'index', initial: [0, 100, 200, 300], dim: 16, limit: [0, 4000]}]}
 */
class Item {
    constructor (parameter) {
        this.parameter = parameter; this.inputs = []; this.state = false; this.data = {}; this.key = this.parameter.key;

        this.card = new Card(this.parameter.label)

        // create inputs according to parameter
        this.parameter.inputs.forEach(element => {
            this.inputs.push(new Input(this.card.card_body, element))
            this.inputs[this.inputs.length - 1].event = () => {this.check()}
        })

        // initiate state
        this.check()

        // difine export jquery object
        this.children = this.card.card
    }

    /**
     * trigger function to check JSON-data correction
     */
    check() {
        let sizes = []; let state_inputs = []
        this.inputs.forEach(input => {
            // capture state of input
            state_inputs.push(input.state)

            // store data
            this.data[input.key] = input.get()

            // capture size of input data-array
            sizes.push(input.get().length)
        })
        
        // update state of item instance
        this.state = sizes.every(value => value === sizes[0]) & state_inputs.reduce((accumulation, element) => accumulation * element, true)

        // update style of inputs according to checked state of Item
        this.inputs.forEach(input => {
            input.update(this.state)
        })

        // call event function at updating a state of item instance
        this.event()
    }

    /**
     * event function at updating item state
     */
    event() {}
}

/**
 * @brief Figure graph based Plotly.js
 * @param id - HTML indificator
 */
class Figure {
    constructor(id) {
        this.id = id; this.data = {};
        // define layout
        this.layout = {grid: {rows: 1, columns: 2, pattern: 'independent'}, 
            plot_bgcolor: $('body').css('background-color'), paper_bgcolor: $('body').css('background-color'), 
            font: {color: $('body').css('color')}}
        this.figure = $('<div></div>').addClass('container-fluid').attr('id', this.id)

        // difine export jquery object
        this.children = this.figure
    }

    /**
     * Load snipper
     */
    load() {
        this.figure.empty()
        this.spinner = $('<div></div>').addClass('d-flex justify-content-center').append(
            $('<div></div>').addClass('spinner-border text-primary').attr('role', 'status').append(
                $('<span></span>').addClass('visually-hidden')
            )
        )
        this.figure.append(this.spinner)
    }

    /**
     * Clear figure
     */
    clear() {
        this.figure.empty()
    }
    
    /**
     * Map data to plotly.j graph
     * @param data JSON data
     * @example data = {dac: {index: [0, 1, 2], value: [1, 2, 3]}, fm: {index: [3, 4, 5], value: [40, 50 ,60]}}
     * @returns JSON of plotly.js object
     */
    data_transform(data) {
        let traces = []
        try {
            traces = [{x: data['dac']['index'], y: data['dac']['value'], type: 'bar', name: 'Voltage'}, 
                {x: data['fm']['index'], y: data['fm']['value'], type: 'bar', xaxis: 'x2', yaxis: 'y2', name: 'Frequency'}]
        }
        catch {
            console.log('data are not transformed')
        }
        return traces
    }

    /**
     * Plot data by means Plotly.js
     * @param data JSON data 
     * @example data = {dac: {index: [0, 1, 2], value: [1, 2, 3]}, fm: {index: [3, 4, 5], value: [40, 50 ,60]}}
     */
    plot(data) {
        this.data = this.data_transform(data)
        Plotly.newPlot(this.id, this.data, this.layout)
    }
}

/**
 * @brief Sending and requesting JSON data from to HTTP server
 * @param parent Jquery instance
 */
class Form {
    constructor(parent) {
        this.parent = parent; this.card_forms = []; this.data = {}; this.data_server = {};
        this.url_send = '/set-param'; this.url_request = '/get-param'; this.type = 'udp'

        // create main card
        this.div = $('<div></div>').addClass('container').css({'padding-top': '5vh', 'width': '80%'})
        this.card_main = new Card('Control panel')

        // create colunm container for card forms
        this.column_card = new Column()

        this.parameters = [
            {label: 'Voltage', key: 'dac', inputs: [{label: 'Index', key: 'index', initial: [0, 1, 2, 3], dim: 16, limit: [0, 15]}, 
                {label: 'Value', key: 'value', initial: [0, 100, 200, 300], dim: 16, limit: [0, 4000]}]},
            {label: 'Frequency', key: 'fm', inputs: [{label: 'Index', key: 'index', initial: [0, 1, 2, 3], dim: 16, limit: [0, 15]}, 
                {label: 'Value', key: 'value', initial: [0, 100, 130, 120], dim: 16, limit: [0, 130]}]}
        ]

        // create card forms
        this.parameters.forEach(element => {
            this.card_forms.push(new Item(element))
            this.column_card.append(this.card_forms[this.card_forms.length - 1].children)
        })

        // define event for card forms
        this.card_forms.forEach(card => {
            card.event = () => {this.event()}
        })

        this.card_main.append(this.column_card.children)

        // create colunm container for buttons
        this.column_button = new Column()

        // create button group
        this.button_group = $('<div></div>').addClass('btn-group w-100')
        this.dropdown_button_group = $('<button></button>').addClass('btn btn-outline-primary dropdown-toggle dropdown-toggle-split')
            .attr({'data-bs-toggle': 'dropdown', 'aria-expanded': 'false'}).append(
                $('<span></span>').addClass('visually-hidden').append('Toggle method')
            )
        this.ul_dropdown = $('<ul></ul>').addClass('dropdown-menu')
        this.li_drpdown = $('<li></li>').addClass('dropdown-item')
        this.radio_li = $('<div></div>').addClass('btn-group w-100').attr({'role': 'group'})
        // create UDP radio
        this.radio_input_udp = $('<input></input>').addClass('btn-check')
            .attr({'type': 'radio', 'name': 'btnradio', 'autocomplete': 'off', 'checked': 'true', 'id': 'radio-upd'})
            .on('change', () => this.change_type('udp'))
        this.radio_label_udp = $('<label></label>').addClass('btn btn-outline-primary')
            .attr({'for': 'radio-upd'}).append('UDP')
        // create HTTP radio
        this.radio_input_http = $('<input></input>').addClass('btn-check')
            .attr({'type': 'radio', 'name': 'btnradio', 'autocomplete': 'off', 'id': 'radio-http'})
            .on('change', () => this.change_type('http'))
        this.radio_label_http = $('<label></label>').addClass('btn btn-outline-primary')
            .attr({'for': 'radio-http'}).append('HTTP')
        // create send button
        this.button_send = $('<button></button>').addClass('btn btn-outline-primary w-100').append('Send')
            .prop('disabled', false).on('click', () => {this.send()})
        // append child elements to button group
        this.radio_li.append([this.radio_input_udp, this.radio_label_udp, this.radio_input_http, this.radio_label_http])
        this.li_drpdown.append(this.radio_li)
        this.ul_dropdown.append(this.li_drpdown)
        this.button_group.append([this.button_send, this.dropdown_button_group, this.ul_dropdown])

        // create request button
        this.button_reqest = $('<button></button>').addClass('btn btn-outline-primary w-100').append('Request')
            .prop('disabled', false).on('click', () => {this.request()})

        // append buttons to main card
        this.column_button.append(this.button_group)
        this.column_button.append(this.button_reqest)
        this.card_main.append(this.column_button.children)

        // append main card to parent object
        this.div.append(this.card_main.children)
        this.parent.append(this.div)

        // request data from server
        this.request()
    }

    /**
     * Event function at updating a card form state 
      */ 
    event() {
        // capture state array of card forms
        let state_items = []
        this.card_forms.forEach(card => {
            state_items.push(card.state)
        })

        // activate a button if any items is true
        this.button_send.prop('disabled', !state_items.reduce((accumulation, element) => accumulation + element, 0))
    }

    /**
     * Send JSON data to http server
     */
    send () {
        // extract data from form
        this.data = {}
        this.card_forms.forEach(card => {
            if (card.state) {
                this.data[card.key] = card.data
            }
        })

        // overwrite data server
        for (let key in this.data) {
            console.log(this.data[key]['value'])
            for (let i = 0; i < this.data[key]['value'].length; i++) {
                let index = this.data[key]['index'][i]
                let value = this.data[key]['value'][i]
                this.data_server[key]['value'][index] = value
            }
        }

        // build request form
        let request = {method: 'POST', headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({type: this.type, data: this.data})}

        fetch(this.url_send, request).then(response => {
            console.log(response)
            // update graph at success request
            if (response.status == 200) {
                this.plot(this.data_server)
            }
        }).catch(error => {
            console.log(error)
        })
        
    }

    /**
     * Request JSON data from http server
     */
    request () {
        fetch(this.url_request).then(response => response.json()).then(json => {
            // if (!this.isempty(json)) {
            if (!$.isEmptyObject(json)) {
                this.data_server = json
                this.plot(this.data_server)
            }
        }).catch(error => console.log(error))
    }

    /**
     * @brief Plot handle function
     * @param data JSON data
     * @example data = {dac: {index: [0, 1, 2], value: [1, 2, 3]}, fm: {index: [3, 4, 5], value: [40, 50 ,60]}}
     */ 
    plot(data) {}

    /**
     * @brief Event at changing radio state
     * @param type string
     * @example type = 'udp'
     */
    change_type(type) {
        this.type = type
    }
}

/**
 * Plotting data
 */
class Monitor {
    /**
     * @brief Monitor interface to plot data
     * @param parent JQuery instance
     */
    constructor (parent) {
        this.parent = parent;

        // create main card
        this.div = $('<div></div>').addClass('container').css({'padding-top': '2vh', 'width': '80%'})
        this.card_main = new Card('Monitor')

        // create figure
        this.figure= new Figure('figure')
        this.figure.load()
        this.card_main.append(this.figure.children)

        // append main card to parent object
        this.div.append(this.card_main.children)
        this.parent.append(this.div)

    }

    /**
     * @brief Plot data
     * @param data JSON
     * @example data = {dac: {index: [0, 1, 2], value: [1, 2, 3]}, fm: {index: [3, 4, 5], value: [40, 50 ,60]}}
     */
    plot(data) {
        this.figure.clear()
        this.figure.plot(data)
    }
}

export {Form, Monitor}