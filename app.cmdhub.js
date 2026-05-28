import * as mqtt from "mqtt";

const client = mqtt.connect("mqtt://192.168.0.32:1883");
const state = {
    now: 0,
    interval1: null,
    interval2: null,

    sent: 0,
    received: 0
}

client.on("connect", () => {
    getValue(`board1`, `Gauge`, `PressureValue`);
    getValue(`board1`, `DiaphragmPump`, `Pumpg-Statn`);
    getValue(`board1`, `TurboPump`, `PumpgStatn`);

    // Set state
    state.now = new Date().getTime();
    state.interval1 = setInterval(() => {
        
    }, 100);

    state.interval2 = setInterval(() => {
        const then = new Date().getTime();
        const dt = then - state.now;

        if (state.sent === state.received || dt > 3000) {
            console.log(``);
            console.log(`SENT: ${state.sent}`);
            console.log(`RECEIVED: ${state.received}`);
            console.log(`SCORE: ${Math.round(state.received / state.sent * 100)}`);
            console.log(`TIME: ${dt}`);
            console.log(``);

            clearInterval(state.interval1);
            clearInterval(state.interval2);

            client.end();
            process.exit(0);
        }
    }, 100);
});

client.on("message", (topic, message) => {
    state.received++;

    const json = JSON.parse(message.toString());

    if (json.status === `ok`) {
        console.log(`${topic} => ${json.value}`);
    } else {
        console.error(`${topic} => ${json.message}`);
    }
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