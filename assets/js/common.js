function dateGetWeekDay() {
    let now = new Date();
    return now.getDay();
}

function dateGetCurrentIsoDate() {
    return (new Date()).toISOString().split('T')[0];
}

function createEmptyItem() {
    return {
        Name: null,
        Status: null,
        active: 1,
        days: [
            {start: null, end: null}, // 0
            {start: null, end: null}, // 1
            {start: null, end: null}, // 2
            {start: null, end: null}, // 3
            {start: null, end: null}, // 4
            {start: null, end: null}, // 5
            {start: null, end: null}, // 6
        ],
        exception: null,
        instanceId: null
    };
}