import { v4 as uuidv4 } from "uuid";

export const createMessage = async (
    db,
    { sender, text, photo_url, file_url }
) => {
    const id = uuidv4();
    await db.query(`
        create table if not exists messages (
            id text primary key,
            sender text not null,
            text varchar,
            photo_url varchar,
            file_url varchar,
            recall boolean default false,
            created_at timestamp);
    `);
    const new_message = await db.query(`
        insert into messages (id, sender, text, photo_url, file_url, created_at)
        values ('${id}', '${sender}', '${text || null}', '${photo_url || null}',
        '${file_url || null}', current_timestamp)
        returing created_at;
    `);
    return {
        id,
        created_at: new_message.rows[0].created_at,
    };
};

export const recallMessge = async (db, { message_id }) => {
    const message = await db.query(`
        update messages set recall=true, text=null, photo_url=null,
        file_url=null, created_at=current_timestamp where id='${message_id}'
        returning created_at;
    `);
    return {
        recall: message.rowCount == 1 ? true : false,
        created_at: message.rows[0].created_at,
    };
};
