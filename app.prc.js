import * as mqtt from "mqtt";

const client = mqtt.connect("mqtt://192.168.0.32:1883");
const state = {
    then: 0,
    now: 0,
    dt: 0,
    interval1: null,
    interval2: null,

    sent: 0,
    received: 0
}

client.on("connect", () => {
    // const index = 5;
    // setValue(`power`, `fuse${index}_enabled`, true);

    // getValue(`power`, `fuse${index}_enabled`);
    // getValue(`power`, `fuse${index}_output_status`);
    // getValue(`power`, `fuse${index}_tripped_status`);
    // getValue(`power`, `fuse${index}_trip_current`);
    // getValue(`power`, `fuse${index}_voltage`);
    // getValue(`power`, `fuse${index}_current`);

    for (let i = 0; i < 8; i++) {
        const index = i + 1;

        getValue(`power`, `fuse${index}_enabled`);
        getValue(`power`, `fuse${index}_output_status`);
        getValue(`power`, `fuse${index}_tripped_status`);
        getValue(`power`, `fuse${index}_trip_current`);
        getValue(`power`, `fuse${index}_voltage`);
        getValue(`power`, `fuse${index}_current`);
    }

    // Set state
    state.then = new Date().getTime();
    state.now = state.then;
    state.interval1 = setInterval(() => {
        state.then = new Date().getTime();
        state.dt = state.then - state.now;
    }, 10);

    state.interval2 = setInterval(() => {
        if (state.sent === state.received) {
            console.log(``);
            console.log(`SENT: ${state.sent}`);
            console.log(`RECEIVED: ${state.received}`);
            console.log(`SCORE: ${Math.round(state.received / state.sent * 100)}`);
            console.log(`TIME: ${state.dt}`);

            client.end();
            clearInterval(state.interval1);
            clearInterval(state.interval2);
        }
    }, 10);
});

client.on("message", (topic, message) => {
    state.received++;

    const json = JSON.parse(message.toString());

    if (json.error) {
        console.error(state.dt, `${topic} => ${json.error}`);
    } else {
        console.log(state.dt, `${topic} => ${json.value}`);
    }
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
    const topic = `board/${board}/parameter/${param}/req`;

    const cmd = {
        cmd: "SET",
        value: value
    };

    client.publish(topic, JSON.stringify(cmd));
    state.sent++;
}