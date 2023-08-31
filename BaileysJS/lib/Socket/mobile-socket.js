"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileSocket = void 0;
const net_1 = require("net");
const Defaults_1 = require("../Defaults");
class MobileSocket extends net_1.Socket {
    constructor(config) {
        super();
        this.config = config;
        this.on('data', (d) => {
            this.emit('message', d);
        });
    }
    connect() {
        return super.connect({
            host: Defaults_1.MOBILE_ENDPOINT,
            port: Defaults_1.MOBILE_PORT,
        }, () => {
            this.emit('open');
        });
    }
    get isOpen() {
        return this.readyState === 'open';
    }
    get isClosed() {
        return this.readyState === 'closed';
    }
    get isClosing() {
        return this.isClosed;
    }
    get isConnecting() {
        return this.readyState === 'opening';
    }
    close() {
        this.end();
    }
    send(data, cb) {
        return super.write(data, undefined, cb);
    }
}
exports.MobileSocket = MobileSocket;
