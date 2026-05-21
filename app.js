import * as mqtt from "mqtt";

const client = mqtt.connect("mqtt://192.168.0.99:1883");
const state = {
  then: 0,
  now: 0,
  dt: 0,
  interval: null,

  sent: 0,
  received: 0
}

client.on("connect", () => {
  for (let i = 0; i < 8; i++) {
    const index = i + 1;

    getValue(`power`, `fuse${index}_enabled`);
    getValue(`power`, `fuse${index}_output_status`);
    getValue(`power`, `fuse${index}_tripped_status`);
    getValue(`power`, `fuse${index}_trip_current`);
    getValue(`power`, `fuse${index}_voltage`);
    getValue(`power`, `fuse${index}_current`);

    getValue(`power`, `pt100_temp${index}`);
    getValue(`power`, `relay${index}_enabled`);
    getValue(`power`, `relay${index}_status`);
  }

  // Set state
  state.then = new Date().getTime();
  state.now = state.then;
  state.interval = setInterval(() => {
    if (state.sent === state.received) {
      console.log(``);
      console.log(`SENT: ${state.sent}`);
      console.log(`RECEIVED: ${state.received}`);
      console.log(`TIME: ${state.dt}`);

      client.end();
      clearInterval(state.interval);
    }
  }, 100);
});

client.on("message", (topic, message) => {
  state.then = new Date().getTime();
  state.dt = state.then - state.now;
  state.received++;

  // console.log(state.dt);
  console.log(`${topic} => ${message}`);
});

function getValue(board, param) {
  subscribe(board, param);
  publishGet(board, param);
}

function setValue(board, param, value) {
  subscribe(board, param);
  publishSet(board, param, value);
}

function subscribe(board, param) {
  client.subscribe(`board/${board}/parameter/${param}/res`);
}

function publishGet(board, param) {
  const topic = `board/${board}/parameter/${param}/req`;

  const cmd = {
    cmd: "GET",
  };

  client.publish(topic, JSON.stringify(cmd));
  state.sent++;
}

function publishSet(board, param, value) {
  const topic = `boards/${board}/parameter/${param}/req`;

  const cmd = {
    cmd: "SET",
    value: value
  };

  client.publish(topic, JSON.stringify(cmd));
  state.sent++;
}