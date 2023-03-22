export const createChat = async (db, { user_id, friend_id }) => {
    await db.query(`
        create table if not exists chats(
            id uuid default uuid_generate_v4() primary key, 
            name varchar, 
            is_group boolean default false,
            chat_avatar varchar,
            members uuid[],
            admins uuid[], 
            last_message text, 
            background_image varchar,
            updated_at timestamp  
        )
    `);
    const new_chat = await db.query(`
        insert into chats(members, updated_at)
        values('{"${user_id}", "${friend_id}"}', current_timestamp)
        returning id, messages, members, last_message, is_group,
        background_image, name, updated_at;
    `);
    return new_chat.rows[0];
};

export const createGroupChat = async (db, { members }) => {
    await db.query(`
        create table if not exists chats(
            id uuid default uuid_generate_v4() primary key, 
            name varchar, 
            is_group boolean default false,
            chat_avatar varchar,
            members text[],
            admins text[], 
            last_message text, 
            background_image varchar,
            updated_at timestamp  
        )
    `);
    const new_group = await db.query(`
        insert into chats(members, admins, is_group, updated_at)
            values('{"${members.join(`", "`)}"}', '{"${
        members[0]
    }"}', true, current_timestamp)
        returning id, members, last_message, is_group,
        background_image, name, updated_at;
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
    return add_members.rows[0];
};

export const addAdmins = async (db, { chat_id, members }) => {
    const add_admins = await db.query(`
        update chats set admins=array_cat(admins, '{"${members.join(`", "`)}"}')
        where id='${chat_id}' returning admins;
    `);
    return add_admins.rows[0];
};

export const getAdmins = async (db, { chat_id }) => {
    const admins = await db.query(`
        select admins from chats
        where id='${chat_id}';
    `);
    return admins.rows[0];
};

export const removeMember = async (db, { chat_id, user_id }) => {
    const remove_members = await db.query(`
        update chats set members=array_remove(members, '${user_id}') , 
        updated_at=current_timestamp
        where id='${chat_id}' returning members, updated_at;
    `);
    return remove_members.rows[0];
};

export const addMessage = async (db, { chat_id, message, updated }) => {
    const add_message = await db.query(`
        update chats set
        updated_at='${updated}',
        last_message='${message}'
        where id='${chat_id}' returning updated_at, last_message;
    `);
    return add_message.rows[0];
};

export const setGroupName = async (db, { chat_id, name }) => {
    const set_group_name = await db.query(`
        update chats set name='${name}',
        updated_at=current_timestamp
        where id='${chat_id}' returning name, updated_at;
    `);
    return set_group_name.rows[0];
};

export const setBackground = async (db, { chat_id, background_image }) => {
    const set_background = await db.query(`
        update chats set background_image='${background_image}',
        updated_at=current_timestamp
        where id='${chat_id}' returning background_image, updated_at;
    `);
    return set_background.rows[0];
};

export const getAllMembers = async (db, { chat_id }) => {
    const members = await db.query(`
        select members from chats
        where id='${chat_id}';
    `);
    return members.rows[0];
};
