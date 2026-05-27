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
    // setValue(`board2`, `Power`, `Fuse1TripCurrent`, 2000);
    // setValue(`board2`, `Power`, `Fuse1Enabled`, true);
    // setValue(`board2`, `Power`, `Fuse2TripCurrent`, 2000);
    // setValue(`board2`, `Power`, `Fuse2Enabled`, false);
    // setValue(`board2`, `Power`, `Fuse3TripCurrent`, 2000);
    // setValue(`board2`, `Power`, `Fuse3Enabled`, true);
    // setValue(`board2`, `Power`, `Fuse4TripCurrent`, 2000);
    // setValue(`board2`, `Power`, `Fuse4Enabled`, true);
    // setValue(`board2`, `Power`, `Fuse5TripCurrent`, 2000);
    // setValue(`board2`, `Power`, `Fuse5Enabled`, false);
    // setValue(`board2`, `Power`, `Fuse6TripCurrent`, 2000);
    // setValue(`board2`, `Power`, `Fuse6Enabled`, true);

    // getValue(`board1`, `Gauge`, `PressureValue`);
    // getValue(`board1`, `DiaphragmPump`, `Pumpg-Statn`);
    // getValue(`board1`, `TurboPump`, `PumpgStatn`);

    // Set state
    state.now = new Date().getTime();
    state.interval1 = setInterval(() => {
        for (let i = 0; i < 8; i++) {
            const index = i + 1;

            getValue(`board2`, `Power`, `Fuse${index}Enabled`);
            getValue(`board2`, `Power`, `Fuse${index}TripCurrent`);
            getValue(`board2`, `Power`, `Fuse${index}OutputStatus`);
            getValue(`board2`, `Power`, `Fuse${index}TrippedStatus`);
            getValue(`board2`, `Power`, `Fuse${index}Voltage`);
            getValue(`board2`, `Power`, `Fuse${index}Current`);
        }
    }, 100);

    state.interval2 = setInterval(() => {
        const then = new Date().getTime();
        const dt = then - state.now;

        if (dt > 1000) {
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
        console.log(`${topic} => ${json.error}`);
    }

    // console.log(state.dt, `${topic} => ${message}`);
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