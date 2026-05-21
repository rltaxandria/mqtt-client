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
    // setValue(`board2`, `Power`, `Fuse1Enabled`, false);
    getValue(`board2`, `Power`, `Fuse1Enabled`);

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
  state.sent++;
}

function publishSet(board, feature, param, value) {
  const baseTopic = `devices/0/boards/${board}/features/${feature}/parameters/${param}`;
  const topic = `${baseTopic}/cmd`;

  const cmd = {
    cmd: "put",
    value: value
  };

  client.publish(topic, JSON.stringify(cmd));
  state.sent++;
}