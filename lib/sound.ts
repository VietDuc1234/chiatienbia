let audioCtx: AudioContext | null = null;

/** Phát tiếng "tinh" ngắn khi ghi điểm thành công (FR-6, §7.1/§7.3). */
export function playScoreSound() {
  audioCtx ??= new AudioContext();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
}
