import { v4 as uuidv4 } from "uuid";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const createMessage = async (
    db,
    { sender, text, photo_url, file_url }
) => {
    const id = uuidv4();
    await db.query(`
        create table if not exists messages (
            id text primary key,
            sender text not null,
            text bytea,
            photo_url varchar,
            file_url varchar,
            recall boolean default false,
            created_at timestamp);
    `);
    const encode_text = text ? encoder.encoder(text) : null;
    const new_message = await db.query(`
        insert into messages (id, sender, text, photo_url, file_url, created_at)
        values ('${id}', '${sender}', '${encode_text || null}', '${
        photo_url || null
    }',
        '${file_url || null}', current_timestamp)
        returning created_at;
    `);
    return {
        id,
        created_at: new_message.rows[0].created_at,
    };
};

export const recallMessge = async (db, { message }) => {
    const messageRecall = await db.query(`
        update messages set recall=true, text=null, photo_url=null,
        file_url=null, created_at=current_timestamp where id='${message}'
        returning created_at;
    `);
    return {
        recall: messageRecall.rowCount == 1 ? true : false,
        created_at: messageRecall.rows[0].created_at,
    };
};

export const getMessage = async (db, { message_id }) => {
    const message = await db.query(`
        select * from messages where id='${message_id}'
    `);
    const result = {
        ...message.rows[0],
        text: decoder.decode(message.rows[0].text),
    };
    return result;
};
