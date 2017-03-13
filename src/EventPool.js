import * as EventStatus from './EventStatus.js'

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
					return EventStatus.ERROR_LISTENER_ALREADY_BINDED
				}
			}
		} else {
			return EventStatus.ERROR_BAD_LISTENER
		}
		return EventStatus.OK
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
				return EventStatus.ERROR_LISTENER_NOT_BINDED
			}
		} else {
			return EventStatus.ERROR_BAD_LISTENER
		}
		return EventStatus.OK
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
			return EventStatus.STATUS_PROCESSED
		} else {
			queue.push( [source, message, ...args] )
			return EventStatus.STATUS_QUEUED
		}
	}
}
