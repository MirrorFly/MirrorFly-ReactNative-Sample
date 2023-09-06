class TimerService {
  constructor() {
    this._timerId = null;
  }

  stopTimer = () => {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  };

  startTimer = cb => {
    if (!this._timerId) {
      this._timerId = setInterval(cb, 1000);
    }
  };
}

export default TimerService;
