import { v4 as uuidv4 } from "uuid";

export const createChat = async (db, { current_id, user_id }) => {
    const id = uuidv4();
    await db.query(`
        create table if not exists chats(
            id text primary key, 
            name varchar, 
            group boolean default false,
            members text[],
            admins text[], 
            messages text[], 
            last_message text, 
            background_image varchar,
            updated_at timestamp  
        )
    `);
    const new_chat = await db.query(`
        insert into chats(id, members, updated_at)
        values('${id}', '{"${current_id}", "${user_id}"}', current_timestamp)
        returning id, updated_at;
    `);
    return new_chat.rows[0];
};

export const createGroupChat = async (db, { current_user, members }) => {
    const id = uuidv4();
    await db.query(`
        create table if not exists chats(
            id text primary key, 
            name varchar, 
            group boolean default false,
            members text[],
            admins text[], 
            messages text[], 
            last_message text, 
            background_image varchar,
            updated_at timestamp  
        )
    `);
    const new_group = await db.query(`
        insert into chats(id, members, admins, updated_at)
        values('${id}', '{"${members.join(
        `", "`
    )}"}', '${current_user}' current_timestamp)
        returning id, updated_at;
    `);
    return new_group.rows[0];
};

export const addMembers = async (db, { chat_id, members }) => {
    const add_members = await db.query(`
        update chats set members=array_cat(members, '{"${members.join(
            `", "`
        )}"}'), updated_at=current_timestamp
        where id='${chat_id}' returning members, updated_at;
    `);
    return {
        members: add_members.rows[0].members,
        updated_at: add_members.rows[0].updated_at,
    };
};

export const addAdmins = async (db, { chat_id, admins }) => {
    const add_admins = await db.query(`
        update chats set admins=array_append(admins, '{"${admins.join(
            `", "`
        )}"}')
        where id='${chat_id}' returning admins;
    `);
    return add_admins.rows[0].admins;
};

export const removeMember = async (db, { chat_id, user_id }) => {
    const remove_members = await db.query(`
        update from chat set members=array_remove(members, '${user_id}') , 
        updated_at=current_timestamp
        where id='${chat_id}' returning members, updated_at;
    `);
    return {
        members: remove_members.rows[0].members,
        updated_at: remove_members.rows[0].updated_at,
    };
};

export const addMessage = async (db, { chat_id, message }) => {
    const add_message = await db.query(`
        update chats set messages=array_append(messages, '${message}'), 
        updated_at=current_timestamp, 
        last_message='${message}'
        where id='${chat_id}' returning updated_at, last_message=;
    `);
    return {
        message: add_message.rows[0].last_message,
        updated_at: add_message.rows[0].updated_at,
    };
};

export const setGroupName = async (db, { chat_id, name }) => {
    const set_group_name = await db.query(`
        update chats set name='${name}',
        updated_at=current_timestamp
        where id='${chat_id}' returning name, updated_at;
    `);
    return {
        name: set_group_name.rows[0].name,
        updated_at: set_group_name.rows[0].updated_at,
    };
};

export const setBackground = async (db, { chat_id, background_image }) => {
    const set_background = await db.query(`
        update chats set background_image='${background_image}', 
        updated_at=current_timestamp
        where id='${chat_id}' returning background_image, updated_at;
    `);
    return {
        background_image: set_background.rows[0].background_image,
        updated_at: set_background.rows[0].updated_at,
    };
};
