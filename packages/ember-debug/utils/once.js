export default function once(callback) {
  let triggered = false;

  return () => {
    if (triggered) {
      return;
    }

    triggered = true;
    callback();
  };
}
