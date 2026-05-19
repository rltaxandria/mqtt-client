import * as mqtt from "mqtt";

const client = mqtt.connect("mqtt://192.168.0.99:1883");
const state = {
  then: 0,
  now: 0,
  dt: 0
}

client.on("connect", () => {
  getValue("power", "fuse1_enabled");

  // Set state
  state.then = new Date().getTime();
  state.now = state.then;
});

client.on("message", (topic, message) => {
  state.now = new Date().getTime();
  state.dt = state.now - state.then;
  state.then = state.now;

  console.log(state.dt);
  console.log(`${topic}: ${message}`);

  client.end();
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
  const baseTopic = `board/${board}/parameter/${param}/res`;
  const topic = `${baseTopic}/value`;

  client.subscribe(topic);
}

function publishGet(board, param) {
  const baseTopic = `board/${board}/parameter/${param}/req`;
  const topic = `${baseTopic}/cmd`;

  const cmd = {
    cmd: "get",
  };

  client.publish(topic, JSON.stringify(cmd));
}

function publishSet(board, param, value) {
  const baseTopic = `boards/${board}/parameter/${param}/req`;
  const topic = `${baseTopic}/cmd`;

  const cmd = {
    cmd: "set",
    value: value
  };

  client.publish(topic, JSON.stringify(cmd));
}