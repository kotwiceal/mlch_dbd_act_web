import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import {Form, Monitor} from './panel.js'

$(document).ready(() => {

    // set dark interface mode
    $('html').attr({'data-bs-theme': 'dark'})

    // create content
    let form = new Form($('#content'))
    let monitor = new Monitor($('#content'))
    // bind handler
    form.plot = (data) => {monitor.plot(data)}

})
