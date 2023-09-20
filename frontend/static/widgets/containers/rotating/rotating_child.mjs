export class RotatingChild {
  /**
   * @param child {HTMLElement|Widget}
   * @param refreshOnSwitch {boolean}
   * @param duration {number}
   * @param intrinsicTiming {boolean}
   */
  constructor ({ child, refreshOnSwitch, duration, intrinsicTiming }) {
    this.child = child
    this.refreshOnSwitch = refreshOnSwitch
    this.duration = duration
    this.intrinsicTiming = intrinsicTiming
  }
}