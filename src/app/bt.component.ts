import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-bt',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <button (click)="requestBluetoothDeviceButtonClick()">
      Request Bluetooth Device
    </button>
    <select #deviceSelect id="devicesSelect">
      @for(device of devices; track $index){
      <option [value]="device">{{ device.name }}</option>
      }
    </select>
    <button (click)="forgetBluetoothDeviceButtonClick(deviceSelect.value)">
      Forget Bluetooth Device
    </button>
  `,
})
export class BTComponent {
  devices: any[] = [];
  requestBluetoothDeviceButtonClick() {
    console.log('Requesting any Bluetooth device...');
    (navigator as any).bluetooth
      .requestDevice({
        // filters: [{ services: ["heart_rate"] }], //<- Prefer filters to save energy & show relevant devices.
        // filters: [{ services: ["battery_service"] }],
        acceptAllDevices: true,
        optionalServices: ['battery_service'],
      })
      .then((device: any) => {
        console.log('> Requested ' + device.name + ' (' + device.id + ')');
        this.devices.push;
        return device.gatt.connect();
      })
      .then((server: any) => {
        console.log(server);
        (navigator as any).bluetooth
          .getDevices()
          .then((data: any) => (this.devices = data));
        return server.getPrimaryService('battery_service');
      })
      .then((service: any) => {
        console.log('Getting Battery Level Characteristic...');
        return service.getCharacteristic('battery_level');
      })
      .then((characteristic: any) => {
        console.log('Reading Battery Level...');
        return characteristic.readValue();
      })
      .then((value: any) => {
        let batteryLevel = value.getUint8(0);
        console.log('> Battery Level is ' + batteryLevel + '%');
      })
      .catch((error: string) => {
        console.log('Argh! ' + error);
      });
  }
  forgetBluetoothDeviceButtonClick(value: any) {
    const id = value.id;
    console.log(id);

    (navigator as any).bluetooth
      .getDevices()
      .then((devices: any) => {
        const device = devices.find((device: any) => device.id == id);
        if (!device) {
          throw new Error('No Bluetooth device to forget');
        }
        console.log('Forgetting ' + device.name + 'Bluetooth device...');
        return device.forget();
      })
      .then(() => {
        console.log('  > Bluetooth device has been forgotten.');
        (navigator as any).bluetooth
          .getDevices()
          .then((data: any) => (this.devices = data));
      })
      .catch((error: any) => {
        console.log('Argh! ' + error);
      });
  }
}
