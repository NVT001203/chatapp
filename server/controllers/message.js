export const createMessage = async (
    db,
    { sender, chat_id, text, photo_url, file_url }
) => {
    await db.query(`
        create table if not exists messages (
            id uuid default uuid_generate_v4() primary key, 
            chat_id text not null,
            sender text not null,
            text varchar,
            photo_url varchar,
            file_url varchar,
            recall boolean default false,
            created_at timestamp);
        create index if not exists idx_chat_id
        on messages(chat_id);
    `);
    const new_message = await db.query(
        `
        insert into messages (chat_id, sender, text, photo_url, file_url, created_at)
        values ('${chat_id}', '${sender}', $1, $2,
        $3, current_timestamp)
        returning *;
    `,
        [text, photo_url, file_url]
    );
    return new_message.rows[0];
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
    return message.rows;
};

export const getLastMessages = async (db, { messages_id }) => {
    try {
        const messages = await db.query(`
            select * from messages where id::text in 
            (select unnest(array['${messages_id.join(`', '`)}'])); 
        `);
        return messages.rows;
    } catch (e) {
        if (e.message == `relation "messages" does not exist`) return [];
        throw new Error(e.message);
    }
};

export const getMessages = async (db, { chat_id }) => {
    try {
        const messages = await db.query(`
            select * from messages where chat_id='${chat_id}'
            order by created_at; 
        `);
        return messages.rows;
    } catch (e) {
        if (e.message == `relation "messages" does not exist`) return [];
        throw new Error(e.message);
    }
};
