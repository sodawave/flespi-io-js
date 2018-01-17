import axios from 'axios'
import merge from 'lodash/merge'
import extender from './flespi-http-io/index'

let _config = {}, /* config of http connection {server, port(optional), token} */
    _methods = ['get', 'post', 'put', 'delete'] /* methods http request */

/* Simple helper by getting up of baseURL parameter */
function getBaseURl () {
    let baseURL = ''
    if (_config.server) {
        baseURL = _config.server
    }
    if (_config.port) {
        baseURL += `:${_config.port}`
    }
    return baseURL
}

/* Main function of http connection. It setting up private variables, global headers and return promise of the request */
function http (options) {
    let config = { baseURL: getBaseURl() }
    return axios(merge(config, options))
}

/* init module logic */
http.init = function init(token, config) {
    if (!Object.keys(_config).length) {
        _config = config
        _config.token = token
        axios.defaults.headers.common['Authorization'] = _config.token
    }
}

/* Updating function of the http connection. Thats update private params of the connection and rebuild client */
http.update = function (type, payload) {
    switch (type) {
        case 'token': {
            _config.token = payload
            axios.defaults.headers.common['Authorization'] = _config.token
            break
        }
        case 'config': {
            _config = Object.assign(_config, payload)
            break
        }
    }
}
/* generate sugar methods for request types GET, POST, PUT, DELETE */
_methods.forEach((method) => {
    /* methods w/o data */
    if (method === 'get' || method === 'delete') {
        http[method] = function (url, options) {
            return http(Object.assign({}, options, { url: url, method: method }))
        }
    }
    /* methods with data */
    else {
        http[method] = function (url, data, options) {
            return http(Object.assign({}, options, { url: url, method: method, data: data }))
        }
    }

})

export default extender(http)