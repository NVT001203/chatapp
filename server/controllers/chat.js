export const createChat = async (db, { user_id, friend_id }) => {
    await db.query(`
        create table if not exists chats(
            id uuid default uuid_generate_v4() primary key, 
            name varchar, 
            is_group boolean default false,
            chat_avatar varchar,
            members uuid[],
            admins uuid[], 
            members_leaved uuid[] default '{}',
            last_message uuid, 
            background_image varchar,
            updated_at timestamp  
        ); 
    `);
    const new_chat = await db.query(`
        insert into chats(members, updated_at)
        values('{"${user_id}", "${friend_id}"}', current_timestamp)
        returning id, members, last_message, is_group,
        background_image, admins, name, updated_at, chat_avatar;
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
            members_leaved uuid[] default '{}',
            last_message uuid, 
            background_image varchar,
            updated_at timestamp  
        )
    `);
    const new_group = await db.query(`
        insert into chats(members, admins, is_group, updated_at)
            values('{"${members.join(`", "`)}"}', '{"${
        members[0]
    }"}', true, current_timestamp)
        returning id, members, last_message, is_group, chat_avatar,
        admins, background_image, name, updated_at;
    `);
    return new_group.rows[0];
};

export const addMembers = async (db, { chat_id, members, last_message }) => {
    let add_members = await db.query(`
        update chats set members=array_cat(members, '{"${members.join(
            `", "`
        )}"}'), updated_at=current_timestamp, last_message='${last_message}'
        where id::text='${chat_id}' returning *;
    `);
    if (
        add_members.rows[0].members_leaved.length != 0 &&
        add_members.rows[0].members_leaved.length !=
            add_members.rows[0].members_leaved.filter(
                (member) => !members.includes(member)
            ).length
    ) {
        const arr =
            add_members.rows[0].members_leaved.filter(
                (member) => !members.includes(member)
            ).length > 0
                ? `array['${add_members.rows[0].members_leaved
                      .filter((member) => !members.includes(member))
                      .join(`', '`)}']`
                : `'{}'`;
        add_members = await db.query(`
            update chats set members_leaved=${arr}
            where id::text='${chat_id}' returning *;
        `);
    }
    return add_members.rows[0];
};

export const addAdmins = async (db, { chat_id, members }) => {
    const add_admins = await db.query(`
        update chats set admins=array_cat(admins, '{"${members.join(`", "`)}"}')
        where id='${chat_id}' returning *;
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
        update chats set members=array_remove(members, '${user_id}'),
        members_leaved=array_append(members_leaved, '${user_id}'),
        admins=array_remove(admins, '${user_id}'),
        updated_at=current_timestamp
        where id='${chat_id}' returning *;
    `);
    return remove_members.rows[0];
};

export const addLastMessage = async (db, { chat_id, message }) => {
    const add_message = await db.query(`
        update chats set
        updated_at=(select created_at from messages where id='${message}'),
        last_message='${message}'
        where id='${chat_id}' returning *;
    `);
    return add_message.rows[0];
};

export const setGroupName = async (db, { chat_id, name }) => {
    const set_group_name = await db.query(`
        update chats set name='${name}',
        updated_at=current_timestamp
        where id='${chat_id}' returning *;
    `);
    return set_group_name.rows[0];
};

export const setBackground = async (db, { chat_id, background_image }) => {
    const set_background = await db.query(
        `
        update chats set background_image=$1,
        updated_at=current_timestamp
        where id=$2 returning *;
    `,
        [background_image, chat_id]
    );
    return set_background.rows[0];
};

export const getAllMembers = async (db, { chat_id }) => {
    const members = await db.query(`
        select members from chats
        where id='${chat_id}';
    `);
    return members.rows[0];
};

export const setChatAvatar = async (db, { chat_id, chat_avatar }) => {
    const chat = await db.query(`
        update chats set chat_avatar='${chat_avatar}'
        where id='${chat_id}' returning *;
    `);
    return chat.rows[0];
};

export const getChats = async (db, { user_id }) => {
    try {
        const chats = await db.query(`
            select * from chats where id in (select unnest(chats) from users where id='${user_id}') order by updated_at desc;
        `);
        return chats.rows;
    } catch (e) {
        if (e.message == `relation "chats" does not exist`) return [];
        else throw new Error(e.message);
    }
};

export const getChat = async (db, { chat_id }) => {
    try {
        const chat = await db.query(`
            select * from chats where id::text='${chat_id}';
        `);
        return chat.rows[0];
    } catch (e) {
        if (e.message == `relation "chats" does not exist`) return [];
        else throw new Error(e.message);
    }
};
export const deleteChat = async (db, { chat_id }) => {
    try {
        const chat = await db.query(`
            delete from chats where id::text='${chat_id}' returning *;
        `);
        return chat.rows[0];
    } catch (e) {
        if (e.message == `relation "chats" does not exist`) return [];
        else throw new Error(e.message);
    }
};

export const checkChatExists = async (db, { users_id }) => {
    try {
        const chat = await db.query(`
            select * from chats where 
            members='{"${users_id.join(`", "`)}"}';
        `);
        if (chat.rows[0]) {
            return { exists: true, chat: chat.rows[0] };
        } else {
            const arr2 = users_id.reverse();
            const chat2 = await db.query(`
                select * from chats where 
                members='{"${arr2.join(`", "`)}"}';
            `);
            if (chat2.rows[0]) return { exists: true, chat: chat2.rows[0] };
            else return false;
        }
    } catch (e) {
        if (e.message == `relation "chats" does not exist`) return false;
        else throw new Error(e.message);
    }
};
