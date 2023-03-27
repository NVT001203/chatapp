let arr = [
    {
        id: 1,
    },
    { id: 2 },
    { id: 3 },
];
console.log(arr);
arr = arr.filter((e) => e.id != 2);
console.log(arr);
