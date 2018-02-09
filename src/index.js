import http from './http'
import socket from './mqtt'
import httpExtender from './flespi-http-io/index'
import socketExtender from './flespi-mqtt-io/camelCase'
import poolExtender from './flespi-pool-io/index'
import poolCamelCaseExtender from './flespi-pool-io/camelCase'
import merge from 'lodash/merge'

/* Class of the connection. It contains of configs and methods of the connection by all protocols. Config contain of settings of current protocol. */
class Connection {
    constructor (config) {
        let defaultConfig = {httpConfig: { server: 'https://flespi.io' }, socketConfig: { server: 'wss://mqtt.flespi.io' }, token: ''}
        this.config = merge(defaultConfig, config) /* config contains {httpConfig, socketConfig, token} */
        this.socket = socket/* setting up mqtt to proto */
        this.http = http/* setting up http to proto */
        this.http.init(this.token, this.httpConfig)/* init HTTP */
        this.socket.init(this.token, this.socketConfig)/* init MQTT */
        /* extending http by sugar */
        httpExtender(this.http).then((sugar) => { Object.assign(this, sugar) })
        /* extending mqtt by sugar */
        Object.assign(this, socketExtender(this.socket))
        this.pool = poolExtender(this.http, this.socket)
        Object.assign(this, poolCamelCaseExtender(this.http, this.socket))
    }
    get token () { return this.config.token }
    set token (token) {
        this.config.token = token
        this.socket.update('token', this.token)
        this.http.update('token', this.token)
    }

    /* httpConfig: {server, port(optional)}. If it is empty, setting up default prod flespi server for http */
    get httpConfig () { return this.config.httpConfig }
    set httpConfig (config) {
        this.config.httpConfig = config
        this.http.update('config', config)
    }
    /* socketConfig: {server, port(optional)}. If it is empty, setting up default prod flespi server for mqtt */
    get socketConfig () { return this.config.socketConfig }
    set socketConfig (config) {
        this.config.socketConfig = config
        this.socket.update('config', config)
    }
}

export default Connection