import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-midi',
  standalone: true,
  template: `
    <input
      type="range"
      min="0"
      max="127"
      [value]="channel"
      #channeli
      (input)="channel = channeli.value"
    />{{ channel }}<br />
    <input
      type="range"
      min="0"
      max="127"
      [value]="value"
      #valuei
      (input)="send(valuei.value)"
    />{{ value }}<br />
    <!-- <button (click)="send()">Send</button> -->
  `,
})
export class MIDIComponent implements OnInit {
  channel = '46';
  value = '0';
  midiOutput: MIDIOutput | undefined;
  midiMessages = {
    noteoff: 0x8, // 8
    noteon: 0x9, // 9
    keyaftertouch: 0xa, // 10
    controlchange: 0xb, // 11
    programchange: 0xc, // 12
    channelaftertouch: 0xd, // 13
    pitchbend: 0xe, // 14
  };
  send(v: string) {
    this.value = v;
    const message = [
      (this.midiMessages.controlchange << 4) + (1 - 1),
      parseInt(this.channel) + 0 * 32,
      parseInt(this.value),
    ];
    this.midiOutput?.send(message);
  }
  ngOnInit(): void {
    navigator
      .requestMIDIAccess()
      .then((access) => {
        console.log(access.outputs);
        access.outputs.forEach((output) => {
          console.table(output);

          //   {time: Utilities.toTimestamp(options.time)}]
          output.open().then(() => (this.midiOutput = output));
        });
      })
      .catch((err) => console.error(err));
  }
}
