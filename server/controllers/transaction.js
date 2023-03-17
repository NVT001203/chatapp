export const begin = (db) => {
    return db.query(`BEGIN`);
};

export const commit = (db) => {
    return db.query(`COMMIT`);
};

export const rollback = (db) => {
    return db.query(`ROLLBACK`);
};
