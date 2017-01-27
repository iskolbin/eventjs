/* 
 
 eventjs -- v0.5.0 public domain JS event emitting/listening
 no warranty implied; use at your own risk

 author: Ilya Kolbin (iskolbin@gmail.com)
 url: github.com/iskolbin/ratio

 LICENSE

 This software is dual-licensed to the public domain and under the following
 license: you are granted a perpetual, irrevocable license to copy, modify,
 publish, and distribute this file as you see fit.

*/

export const OK = 'Ok'
export const STATUS_PROCESSED = 'Processed'
export const STATUS_QUEUED = 'Queued'
export const ERROR_BAD_LISTENER = 'Listener is nil'
export const ERROR_LISTENER_ALREADY_BINDED = 'Listener is already binded'
export const ERROR_LISTENER_NOT_BINDED = 'Listener is not binded'

export class EventPool {
	constructor() {
		this.listeners = new Map()
		this.queue = new Array()
	}

	bind( source, listener ) {
		if ( listener ) {
			const listeners = this.listeners.get( source )
			if ( !listeners ) {
				this.listeners.set( source, new Set( [listener] ))
			} else {
				if ( !listeners.has( listener )) {
					listeners.add( listener )
				} else {
					return ERROR_LISTENER_ALREADY_BINDED
				}
			}
		} else {
			return ERROR_BAD_LISTENER
		}
		return OK
	}

	unbind( source, listener ) {
		if ( listener ) {
			const listeners = this.listeners.get( source ) 
			if ( listeners && listeners.has( listener )) {
				listeners.delete( listener )
				if ( listeners.size == 0 ) {
					this.listeners.delete( source )
				}
			} else {
				return ERROR_LISTENER_NOT_BINDED
			}
		} else {
			return ERROR_BAD_LISTENER
		}
		return OK
	}

	notify( source, message, ...args ) {
		const listeners = this.listeners.get( source ) 
		if ( listeners ) {
			for ( let listener of this.listeners.get( source )) {
				const handler = listener[message]
				if ( handler instanceof Function ) {
					handler.call( listener, source, ...args )
				}
			}
		}
	}

	emit( source, message, ...args ) {
		const queue = this.queue
		if ( queue.length === 0 ) {
			this.notify( source, message, ...args )
			for ( let processed = 0; processed < queue.length; processed++ ) {
				this.notify.apply( this, queue[processed] ) 
			}
			queue.splice( 0 )
			return STATUS_PROCESSED
		} else {
			queue.push( [source, message, ...args] )
			return STATUS_QUEUED
		}
	}
}

const defaultPool = new EventPool()

export const bind   = ( s, l ) => defaultPool.bind( s, l )
export const unbind = ( s, l ) => defaultPool.unbind( s, l )
export const notify = ( s, m, ...args ) => defaultPool.notify( s, m, ...args )
export const emit   = ( s, m, ...args ) => defaultPool.emit( s, m, ...args )
