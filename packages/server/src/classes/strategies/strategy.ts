/**
 * Default class for strategy implementation.
 */
export default class Strategy {
    protected percentage = 0;

    protected _inPosition = false;
    protected _inPositionArray = [false, false];

    protected _profits: Array<number> = [];
}