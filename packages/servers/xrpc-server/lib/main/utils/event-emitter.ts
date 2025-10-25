/** Converts a tuple into a listener function */
export type ListenerFor<T extends any[]> = (...args: T) => void;

/** Generic record of the event name and its argument tuple */
export type EventMap = {
	[key: string | symbol]: any[];
};

type MaybeArray<T> = T | T[];

/** Event emitter */
export class EventEmitter<Events extends EventMap> {
	#events?: { [E in keyof Events]?: MaybeArray<ListenerFor<Events[E]>> };

	/**
	 * Appends a listener for the specified event name
	 * @param name Name of the event
	 * @param listener Callback that should be invoked when an event is dispatched
	 * @returns Cleanup function that can be called to remove it
	 */
	on<E extends keyof Events>(name: E, listener: ListenerFor<Events[E]>): () => void {
		let events = this.#events;
		let existing: MaybeArray<ListenerFor<Events[E]>> | undefined;

		if (events === undefined) {
			events = this.#events = Object.create(null);
		} else {
			existing = events[name];
		}

		if (existing === undefined) {
			events![name] = listener;
		} else if (typeof existing === 'function') {
			events![name] = [existing, listener];
		} else {
			events![name] = existing.concat(listener);
		}

		// @ts-expect-error: complains about `listener`
		return this.off.bind(this, name, listener);
	}

	/**
	 * Remove listener from the specified event name
	 * @param name Name of the event
	 * @param listener Callback to remove
	 */
	off<E extends keyof Events>(name: E, listener: ListenerFor<Events[E]>): void {
		const events = this.#events;

		if (events === undefined) {
			return;
		}

		const list = events[name];

		if (list == undefined) {
			return;
		}

		if (list === listener) {
			delete events[name];
		} else if (typeof list !== 'function') {
			const index = list.indexOf(listener);

			if (index !== -1) {
				if (list.length === 2) {
					// ^ flips the bit, it's either 0 or 1 here.
					events[name] = list[index ^ 1];
				} else {
					events[name] = list.toSpliced(index, 1);
				}
			}
		}
	}

	/**
	 * Emit an event with the specified name and its payload
	 * @param name Name of the event
	 * @param args Payload for the event
	 * @returns Whether a listener has been called
	 */
	emit<E extends keyof Events>(name: E, ...args: Events[E]): boolean {
		const events = this.#events;

		if (events === undefined) {
			return false;
		}

		const handler = events[name];

		if (handler === undefined) {
			return false;
		}

		if (typeof handler === 'function') {
			handler.apply(this, args);
		} else {
			for (let idx = 0, len = handler.length; idx < len; idx++) {
				handler[idx].apply(this, args);
			}
		}

		return true;
	}

	/**
	 * Determines if there is a listener on a specified event name
	 * @param name Name of the event
	 * @returns Whether there is a listener registered
	 */
	has(name: keyof Events): boolean {
		const events = this.#events;
		return events !== undefined && name in events;
	}
}
