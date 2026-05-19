import * as mqtt from "mqtt";

const client = mqtt.connect("mqtt://192.168.0.32:1883");
const state = {
  then: 0,
  now: 0,
  dt: 0
}

client.on("connect", () => {
  // getValue(`board1`, `StirlingCooler`, `mode_setting`);
  // setValue(`board1`, `StirlingCooler`, `mode_setting`, 'shutdown');

  // getValue(`board1`, `TurboPump`, `ActualSpdRPM`);
  getValue(`board1`, `Valves`, `Valve1`);
  getValue(`board1`, `Valves`, `Valve2`);
  getValue(`board1`, `Valves`, `Valve3`);
  getValue(`board1`, `Valves`, `Valve4`);
  getValue(`board1`, `Valves`, `Valve5`);
  getValue(`board1`, `Valves`, `Valve6`);
  getValue(`board1`, `Valves`, `Valve7`);
  // getValue(`board1`, `Gauge`, `PressureValue`);
  // getValue(`board4`, `Amplifier`, `AmplifierState1`);

  // getValue(`board1`, `Motors`, `BallPos`);
  // getValue(`board1`, `Motors`, `BallActualPos`);
  // getValue(`board1`, `Motors`, `BallError`);
  // setValue(`board1`, `Motors`, `BallPos`, true);

  state.then = new Date().getTime();
  state.now = state.then;
});

client.on("message", (topic, message) => {
  state.now = new Date().getTime();
  state.dt = state.now - state.then;
  state.then = state.now;

  console.log(state.dt);
  console.log(`${topic}: ${message}`);

  // client.end();
});

function getValue(board, feature, param) {
  subscribe(board, feature, param);
  publishGet(board, feature, param);
}

function setValue(board, feature, param, value) {
  subscribe(board, feature, param);
  publishSet(board, feature, param, value);
}

function subscribe(board, feature, param) {
  const baseTopic = `devices/0/boards/${board}/features/${feature}/parameters/${param}`;
  const topic = `${baseTopic}/value`;

  client.subscribe(topic);
}

function publishGet(board, feature, param) {
  const baseTopic = `devices/0/boards/${board}/features/${feature}/parameters/${param}`;
  const topic = `${baseTopic}/cmd`;

  const cmd = {
    cmd: "get",
  };

  client.publish(topic, JSON.stringify(cmd));
}

function publishSet(board, feature, param, value) {
  const baseTopic = `devices/0/boards/${board}/features/${feature}/parameters/${param}`;
  const topic = `${baseTopic}/cmd`;

  const cmd = {
    cmd: "put",
    value: value
  };

  client.publish(topic, JSON.stringify(cmd));
}