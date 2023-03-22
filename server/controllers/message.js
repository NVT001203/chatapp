const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const createMessage = async (
    db,
    { sender, chat_id, text, photo_url, file_url }
) => {
    const id = uuidv4();
    await db.query(`
        create table if not exists messages (
            id uuid default uuid_generate_v4() primary key, 
            chat_id text not null,
            sender text not null,
            text bytea,
            photo_url varchar,
            file_url varchar,
            recall boolean default false,
            created_at timestamp);
        create index if not exists idx_chat_id
        on messages(chat_id);
    `);
    const encode_text = text ? encoder.encoder(text) : null;
    const new_message = await db.query(`
        insert into messages (chat_id, sender, text, photo_url, file_url, created_at)
        values ('${chat_id}', '${sender}', '${encode_text || null}', '${
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
