export const createMessage = async (
    db,
    { sender, chat_id, text, photo_url, file_url }
) => {
    await db.query(`
        create table if not exists messages (
            id uuid default uuid_generate_v4() primary key, 
            chat_id uuid not null,
            sender uuid not null,
            text varchar,
            photo_url varchar,
            file_url varchar,
            recall boolean default false,
            created_at timestamp);
        create index if not exists idx_chat_id
        on messages(chat_id);
    `);
    await db.query(`
        create table if not exists photos (
            id uuid default uuid_generate_v4(), 
            chat_id uuid not null, 
            photo_url varchar not null, 
            created_at timestamp default current_timestamp
        );
        create index if not exists idx_chat_id
        on photos(chat_id);
    `);
    const new_message = await db.query(
        `
        insert into messages (chat_id, sender, text, photo_url, file_url, created_at)
        values ('${chat_id}', '${sender}', $1, $2,
        $3, current_timestamp)
        returning id, chat_id, sender, text, photo_url, file_url, recall, created_at;
    `,
        [text, photo_url, file_url]
    );
    if (photo_url) {
        const addPhoto = await db.query(`
        insert into photos(chat_id, photo_url, created_at) 
        values ('${chat_id}', '${photo_url}', (select created_at from messages where id::text='${new_message.rows[0].id}')) 
        returning id, chat_id, photo_url, created_at;
        `);
        return { message: new_message.rows[0], photo: addPhoto.rows[0] };
    }
    return { message: new_message.rows[0] };
};

export const recallMessge = async (db, { message }) => {
    const messageRecall = await db.query(`
        update messages set recall=true, text=null, photo_url=null,
        file_url=null, created_at=current_timestamp where id='${message}'
        returning id, chat_id, sender, text, photo_url, file_url, recall, created_at;
    `);
    return {
        recall: messageRecall.rowCount == 1 ? true : false,
        created_at: messageRecall.rows[0].created_at,
    };
};

export const getMessage = async (db, { message_id }) => {
    const message = await db.query(`
        select id, chat_id, sender, text, photo_url, file_url, recall, created_at from messages where id='${message_id}'
    `);
    return message.rows;
};

export const getLastMessages = async (db, { messages_id }) => {
    try {
        const messages = await db.query(`
            select concat(m.id, n.id) id
            , concat(m.chat_id, n.chat_id) chat_id, 
            notice, chat_created,
            concat(m.text, n.text) text,
            concat(m.sender, n.sender) sender, 
            recall, photo_url, file_url, 
            concat(m.created_at, n.created_at) created_at from messages m
            full outer join notices n
            on m.id=n.id where
            m.id::text in (select unnest(array['${messages_id.join(`', '`)}'])) 
            or n.id::text in (select unnest(array['${messages_id.join(
                `', '`
            )}']))
            order by created_at;
        `);
        return messages.rows;
    } catch (e) {
        if (e.message == `relation "messages" does not exist`) return [];
        throw new Error(e.message);
    }
};

export const getLastNotices = async (db, { chats_id }) => {
    try {
        // const messages = await db.query(`
        //     select * from messages where id::text in
        //     (select unnest(array['${messages_id.join(`', '`)}']));
        // `);

        const notices = await db.query(`
            select * from notices 
            where chat_id::text in (select unnest(array['${chats_id.join(
                `', '`
            )}']))
            order by created_at;
        `);
        return notices.rows;
    } catch (e) {
        if (e.message == `relation "messages" does not exist`) return [];
        throw new Error(e.message);
    }
};

export const getMessages = async (db, { chat_id }) => {
    try {
        const messages = await db.query(`
            select concat(m.id, n.id) id
            , concat(m.chat_id, n.chat_id) chat_id, 
            notice, chat_created,
            concat(m.text, n.text) text,
            concat(m.sender, n.sender) sender, 
            recall, photo_url, file_url, 
            concat(m.created_at, n.created_at)::timestamp with time zone created_at from messages m
            full outer join notices n
            on m.id=n.id where
            m.chat_id::text='${chat_id}' 
            or n.chat_id::text='${chat_id}'
            order by created_at; 
        `);
        return messages.rows;
    } catch (e) {
        if (e.message == `relation "messages" does not exist`) return [];
        throw new Error(e.message);
    }
};

export const getPhotos = async (db, { chat_id }) => {
    try {
        const photos = await db.query(`
            select id, chat_id, photo_url, created_at from photos where chat_id='${chat_id}'
            order by created_at; 
        `);
        return photos.rows;
    } catch (e) {
        if (e.message == `relation "photos" does not exist`) return [];
        throw new Error(e.message);
    }
};

export const createNotice = async (
    db,
    { text, chat_id, sender, chat_created }
) => {
    await db.query(`
        create table if not exists notices(
            id uuid default uuid_generate_v4() primary key,
            notice boolean default true,
            chat_created boolean default false,
            chat_id uuid not null,
            text text not null, 
            sender uuid, 
            created_at timestamp default current_timestamp
        );
        create index if not exists idx_chat_id 
        on notices(chat_id);
    `);
    const notice = await db.query(
        `
        insert into notices(chat_id, text, sender, chat_created) values($1, $2, $3, $4)
        returning id, notice, chat_created, chat_id, text, sender, created_at;
    `,
        [chat_id, text, sender, chat_created ? chat_created : false]
    );
    return notice.rows[0];
};

export const createAddAndRemoveMembersNotices = async (
    db,
    { user_id, members, chat_id, add, remove }
) => {
    let values = [];
    members.forEach((member) => {
        values.push(
            `('${chat_id}', 'was ${add ? "add" : "remove"} /u${member}/u ${
                add ? "to" : "from the"
            } group', '${user_id}')`
        );
    });
    const notices = await db.query(`
        insert into notices(chat_id, text, sender) 
        values ${values.join(`,`)} 
        returning id, notice, chat_created, chat_id, text, sender, created_at;
    `);
    return notices.rows;
};

export const deleteMessages = async (db, { chat_id }) => {
    try {
        const notices = await db.query(`
        delete from notices where chat_id::text='${chat_id}';
    `);
        const messages = await db.query(`
        delete from messages where chat_id::text='${chat_id}';
    `);
        return true;
    } catch (e) {
        if (e.message == `relation "messages" does not exist`) return true;
        else throw new Error(e.message);
    }
};
