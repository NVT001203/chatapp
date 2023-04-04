const obj = {
    "zJm2D0ZuDy0m0-EvAAAJ": "6335d433-c584-4944-9dac-c527b8a47920",
    WF4brbwLewX7SA6zAAAL: "2f3a2016-657d-4597-b728-feba104a6a09",
};
const members = ["2f3a2016-657d-4597-b728-feba104a6a09"];

Object.entries(obj).forEach(([id, user_id]) => {
    if (members.includes(user_id)) console.log(true);
});
