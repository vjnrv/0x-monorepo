/**
 * Tracks a maker's history of timely responses, and manages whether a given
 * maker should be avoided for being too latent.
 */

import { logUtils } from '@0x/utils';

import { constants } from '../constants';
import { LogFunction } from '../types';

export class RfqMakerBlacklist {
    private readonly _makerTimeoutStreakLength: { [makerUrl: string]: number } = {};
    private readonly _makerBlacklistedUntilDate: { [makerUrl: string]: number } = {};
    constructor(
        private readonly _blacklistDurationMinutes: number,
        private readonly _timeoutStreakThreshold: number,
        public infoLogger: LogFunction = (obj, msg) => logUtils.log(`${msg ? `${msg}: ` : ''}${JSON.stringify(obj)}`),
    ) {}
    public logTimeoutOrLackThereof(makerUrl: string, didTimeout: boolean): void {
        if (!this._makerTimeoutStreakLength.hasOwnProperty(makerUrl)) {
            this._makerTimeoutStreakLength[makerUrl] = 0;
        }
        if (didTimeout) {
            this._makerTimeoutStreakLength[makerUrl] += 1;
            if (this._makerTimeoutStreakLength[makerUrl] === this._timeoutStreakThreshold) {
                this._makerBlacklistedUntilDate[makerUrl] =
                    Date.now() + this._blacklistDurationMinutes * constants.ONE_MINUTE_MS;
                this.infoLogger(
                    { makerUrl, blacklistedUntil: new Date(this._makerBlacklistedUntilDate[makerUrl]).toISOString() },
                    'maker blacklisted',
                );
            }
        } else {
            this._makerTimeoutStreakLength[makerUrl] = 0;
        }
    }
    public isMakerBlacklisted(makerUrl: string): boolean {
        const now = Date.now();
        if (now > this._makerBlacklistedUntilDate[makerUrl]) {
            delete this._makerBlacklistedUntilDate[makerUrl];
            this.infoLogger({ makerUrl }, 'maker unblacklisted');
        }
        return this._makerBlacklistedUntilDate[makerUrl] > now;
    }
}
