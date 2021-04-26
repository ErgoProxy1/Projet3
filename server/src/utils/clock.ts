import { Subscription } from 'rxjs';

export class Clock {

    public secondsRemaining:number;
    public clockSubscription: Subscription;
    public clockInterval:number;
    public clockIsSuspended:boolean = true;

    constructor(secondsRemaining:number) {
        this.secondsRemaining = secondsRemaining;
    }


    decrementClock() {
        this.secondsRemaining--;
    }
    
}