/// <reference types="node" />
import { Socket } from 'net';
import { SocketConfig } from '../Types';
export declare class MobileSocket extends Socket {
    config: SocketConfig;
    constructor(config: SocketConfig);
    connect(): this;
    get isOpen(): boolean;
    get isClosed(): boolean;
    get isClosing(): boolean;
    get isConnecting(): boolean;
    close(): void;
    send(data: unknown, cb?: ((err?: Error | undefined) => void) | undefined): boolean;
}
