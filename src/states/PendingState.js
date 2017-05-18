/**
 * Created by roman on 25.04.17.
 */

import React from 'react'
import State from './State'

export default class PendingState extends State {
    static LOADING_MESSAGE = <span><i className="fa fa-fw fa-circle-o-notch fa-spin"/> Обработка</span>;

    state = null;
    rejectFn = null;

    constructor(options, rejectFn) {
        // super(PendingState.LOADING_MESSAGE);
        super({
            message: PendingState.LOADING_MESSAGE,
            ...options
        });

        this.rejectFn = rejectFn;
    }

    abort() {
        this.rejectFn();
    }
}