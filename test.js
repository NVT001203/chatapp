const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question("Enter friend name: ", (displayName) => {
    let pattern = new RegExp(`${displayName}`, "i");
    if ("trang".match(pattern)) console.log(true);
    else console.log(false);
    readline.close();
});
