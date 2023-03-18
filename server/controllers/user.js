import { v4 as uuidv4 } from "uuid";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const createUser = async (
    db,
    { email, password, display_name, avatar_url }
) => {
    const id = uuidv4();
    await db.query(`
        create table if not exists users(
            id text primary key, 
            email varchar unique not null, 
            password varchar, 
            display_name bytea, 
            oauth_id varchar,
            avatar_url varchar, 
            chats uuid[] default '{}',
            hidden_chats uuid[] default '{}'
        ); 
    `);
    const user = await db.query(
        `
        insert into users(id, email, password, display_name, avatar_url)
        values ($1, $2, $3, $4, $5)
        returning id;
    `,
        [id, email, password, encoder.encode(display_name), avatar_url]
    );
    return user.rows[0];
};

export const createUserOauth = async (
    db,
    { email, display_name, avatar_url, oauth_id }
) => {
    const id = uuidv4();
    await db.query(`
        create table if not exists users(
            id text primary key, 
            email varchar unique not null, 
            password varchar, 
            display_name bytea, 
            oauth_id varchar,
            avatar_url varchar, 
            chats uuid[] default '{}',
            hidden_chats uuid[] default '{}'
        ); 
    `);
    const user = await db.query(
        `
        insert into users(id, email, display_name, avatar_url, oauth_id)
            values ($1, $2, $3, $4, $5)
            returning id;
        `,
        [id, email, encoder.encode(display_name), avatar_url, oauth_id]
    );
    return user.rows[0];
};

export const getPublicInfo = async (db, { user_id }) => {
    const user = await db.query(`
        select display_name, avatar_url from users 
        where id = '${user_id}';
    `);
    const decodeName = decoder.decode(user.rows[0].display_name);
    return {
        display_name: decodeName,
        avatar_url: user.rows[0].avatar_url,
    };
};

export const updatePublicInfo = async (
    db,
    { user_id, display_name, avatar_url }
) => {
    const publicInfo = await db.query(`
        update users set display_name = '${encoder.encode(
            display_name
        )}', avatar_url = '${avatar_url}'
        where id = '${user_id}';
    `);
    if (publicInfo.rowCount == 1) return true;
    else throw new Error("Update failed!");
};

export const getChats = async (db, { user_id }) => {
    const chats = await db.query(`
        select chats from users where id = '${user_id}';
    `);
    return chats.rows[0];
};

export const hiddenChat = async (db, { user_id, chat_id }) => {
    const chats = await db.query(`
        update users set chats = array_remove(chats, '${chat_id}'), 
        hidden_chats=array_append(hidden_chats, '${chat_id}')
        where id = '${user_id}'
        returning chats;
    `);
    if (chats.rowCount == 1) return { chats };
    else throw new Error("Update failed!");
};

export const displayChat = async (db, { user_id, chat_id }) => {
    const chats = await db.query(`
        update users set chats = array_append(chats, '${chat_id}'), 
        hidden_chats=array_remove(hidden_chats, '${chat_id}')
        where id = '${user_id}'
        returning chats;
    `);
    if (chats.rowCount == 1) return { chats };
    else throw new Error("Update failed!");
};

export const addChat = async (db, { user_id, chat_id }) => {
    const chats = await db.query(`
        update users set chats = array_append(chats, '${chat_id}')
        where id = '${user_id}'
        returning chats;
    `);
    if (chats.rowCount == 1) return { chats };
    else throw new Error("Add failed!");
};
export const removeChat = async (db, { user_id, chat_id }) => {
    const chats = await db.query(`
        update users set chats = array_remove(chats, '${chat_id}')
        where id = '${user_id}'
        returning chats;
    `);
    if (chats.rowCount == 1) return { chats };
    else throw new Error("Remove failed!");
};

export const addSocketId = async (db, { user_id, id }) => {
    const socket_id = await db.query(`
        update users set socket_id = '${id}' where id='${user_id}';
    `);
};
export const removeSocketId = async (db, { user_id }) => {
    const socket_id = await db.query(`
        update users set socket_id = null where id='${user_id}';
    `);
};
