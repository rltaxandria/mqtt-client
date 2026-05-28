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
    const index = 3;
    // setValue(`power`, `fuse${index}_enabled`, false);
    // setValue(`power`, `fuse${index}_trip_current`, 2000);
    // setValue(`power`, `fuse${index}_enabled`, true);

    getValue(`power`, `fuse${index}_enabled`);
    getValue(`power`, `fuse${index}_output_status`);
    getValue(`power`, `fuse${index}_tripped_status`);
    getValue(`power`, `fuse${index}_trip_current`);
    getValue(`power`, `fuse${index}_voltage`);
    getValue(`power`, `fuse${index}_current`);

    // setValue(`source`, `flyback_enabled`, true);
    // getValue(`source`, `flyback_enabled`);

    // setValue(`comm`, `fan1_speed`, 100);

    // getValue(`comm`, `fan1_speed`);
    // getValue(`comm`, `fan1_tacho`);
    // getValue(`comm`, `fan1_current`);

    // getValue(`source`, `flyback_enabled`);
    // getValue(`source`, `flyback_100v`);
    // getValue(`source`, `flyback_min150v`);
    // getValue(`source`, `filament_status`);

    // setValue(`amplifier`, `amplifier17_control`, 0x300E);
    // getValue(`amplifier`, `amplifier17_status`);
    // getValue(`amplifier`, `amplifier17_control`);

    // Set state
    state.now = new Date().getTime();
    state.interval1 = setInterval(() => {
        // for (let i = 0; i < 8; i++) {
        //     const index = i + 1;

        //     getValue(`power`, `fuse${index}_enabled`);
        //     getValue(`power`, `fuse${index}_output_status`);
        //     getValue(`power`, `fuse${index}_tripped_status`);
        //     getValue(`power`, `fuse${index}_trip_current`);
        //     getValue(`power`, `fuse${index}_voltage`);
        //     getValue(`power`, `fuse${index}_current`);
        // }
    }, 100);

    state.interval2 = setInterval(() => {
        const then = new Date().getTime();
        const dt = then - state.now;

        if (state.then === state.received || dt > 1000) {
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
    }, 10);
});

client.on("message", (topic, message) => {
    state.received++;

    const json = JSON.parse(message.toString());

    if (json.error) {
        console.error(`${topic} => ${json.error}`);
    } else {
        console.log(`${topic} => ${json.value}`);
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