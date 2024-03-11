console.log("Hello");
function populateBluetoothDevices() {
  const devicesSelect = document.querySelector("#devicesSelect");
  console.log("Getting existing permitted Bluetooth devices...");
  console.log(navigator.bluetooth);
  navigator.bluetooth
    .getDevices()
    .then((devices) => {
      console.log("> Got " + devices.length + " Bluetooth devices.");
      devicesSelect.textContent = "";
      for (const device of devices) {
        const option = document.createElement("option");
        console.log(device);
        option.value = device.id;
        option.textContent = device.name;
        devicesSelect.appendChild(option);
        device.addEventListener("advertisementreceived", (event) => {
          log("Advertisement received.");
          log("  Device Name: " + event.device.name);
          log("  Device ID: " + event.device.id);
          log("  RSSI: " + event.rssi);
          log("  TX Power: " + event.txPower);
          log("  UUIDs: " + event.uuids);
          event.manufacturerData.forEach((valueDataView, key) => {
            logDataView("Manufacturer", key, valueDataView);
          });
          event.serviceData.forEach((valueDataView, key) => {
            logDataView("Service", key, valueDataView);
          });
        });
      }
    })
    .catch((error) => {
      console.log("Argh! " + error);
    });
}

function onRequestBluetoothDeviceButtonClick() {
  console.log("Requesting any Bluetooth device...");
  navigator.bluetooth
    .requestDevice({
      // filters: [{ services: ["heart_rate"] }], //<- Prefer filters to save energy & show relevant devices.
      // filters: [{ services: ["battery_service"] }],
      acceptAllDevices: true,
      optionalServices: ["battery_service"],
    })
    .then((device) => {
      console.log("> Requested " + device.name + " (" + device.id + ")");
      populateBluetoothDevices();
      return device.gatt.connect();
    })
    .then((server) => {
      console.log(server);

      return server.getPrimaryService("battery_service");
    })
    .then((service) => {
      console.log("Getting Battery Level Characteristic...");
      return service.getCharacteristic("battery_level");
    })
    .then((characteristic) => {
      console.log("Reading Battery Level...");
      return characteristic.readValue();
    })
    .then((value) => {
      let batteryLevel = value.getUint8(0);
      console.log("> Battery Level is " + batteryLevel + "%");
    })
    .catch((error) => {
      console.log("Argh! " + error);
    });
}

function onForgetBluetoothDeviceButtonClick() {
  navigator.bluetooth
    .getDevices()
    .then((devices) => {
      const deviceIdToForget = document.querySelector("#devicesSelect").value;
      const device = devices.find((device) => device.id == deviceIdToForget);
      if (!device) {
        throw new Error("No Bluetooth device to forget");
      }
      console.log("Forgetting " + device.name + "Bluetooth device...");
      return device.forget();
    })
    .then(() => {
      console.log("  > Bluetooth device has been forgotten.");
      populateBluetoothDevices();
    })
    .catch((error) => {
      console.log("Argh! " + error);
    });
}

document
  .querySelector("#requestBluetoothDevice")
  .addEventListener("click", onRequestBluetoothDeviceButtonClick);
document
  .querySelector("#forgetBluetoothDevice")
  .addEventListener("click", onForgetBluetoothDeviceButtonClick);
navigator.bluetooth.getDevices().then((data) => console.log(data));
