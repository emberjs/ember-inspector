import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class TimeTravelController extends Controller {
  @service port;

  @tracked recording = false;
  @tracked snapshots = [];
  @tracked currentIndex = -1;

  get hasSnapshots() {
    return this.snapshots.length > 0;
  }

  get maxIndex() {
    return Math.max(this.snapshots.length - 1, 0);
  }

  get displayIndex() {
    return this.currentIndex + 1;
  }

  get isAtLatest() {
    return this.currentIndex === this.snapshots.length - 1;
  }

  get selectedSnapshot() {
    return this.snapshots[this.currentIndex];
  }

  get selectedTime() {
    const snapshot = this.selectedSnapshot;
    if (!snapshot) {
      return '';
    }
    const date = new Date(snapshot.timestamp);
    return `${date.toLocaleTimeString()}.${String(
      date.getMilliseconds(),
    ).padStart(3, '0')}`;
  }

  updateState({ recording, snapshots, currentIndex }) {
    this.recording = recording;
    this.snapshots = snapshots;
    this.currentIndex = currentIndex;
  }

  @action
  toggleRecording() {
    this.port.send(
      this.recording ? 'timeTravel:stopRecording' : 'timeTravel:startRecording',
    );
  }

  @action
  clear() {
    this.port.send('timeTravel:clear');
  }

  @action
  travel(event) {
    const index = parseInt(event.target.value, 10);
    if (isNaN(index) || !this.snapshots[index]) {
      return;
    }
    this.currentIndex = index;
    this.port.send('timeTravel:travel', { index });
  }
}
