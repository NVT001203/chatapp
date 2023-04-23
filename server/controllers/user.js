export const createUser = async (
    db,
    { email, password, display_name, avatar_url }
) => {
    await db.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        create table if not exists users(
            id uuid default uuid_generate_v4() primary key, 
            email varchar unique not null, 
            password varchar, 
            display_name varchar, 
            oauth_id varchar,
            avatar_url varchar, 
            chats uuid[] default '{}',
            hidden_chats uuid[] default '{}'
        ); 
    `);
    const user = await db.query(
        `
        insert into users(email, password, display_name, avatar_url)
        values ($1, $2, $3, $4)
        returning id;
    `,
        [email, password, display_name, avatar_url]
    );
    return user.rows[0];
};

export const createUserOauth = async (
    db,
    { email, display_name, avatar_url, oauth_id }
) => {
    await db.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        create table if not exists users(
            id uuid default uuid_generate_v4() primary key, 
            email varchar unique not null, 
            password varchar, 
            display_name varchar, 
            oauth_id varchar,
            avatar_url varchar, 
            chats uuid[] default '{}',
            hidden_chats uuid[] default '{}'
        ); 
    `);
    const user = await db.query(
        `
        insert into users(email, display_name, avatar_url, oauth_id)
            values ($1, $2, $3, $4)
            returning id;
        `,
        [email, display_name, avatar_url, oauth_id]
    );
    return user.rows[0];
};

export const getPublicInfo = async (db, { user_id }) => {
    const user = await db.query(`
        select display_name, avatar_url from users 
        where id = '${user_id}';
    `);

    return {
        display_name: user.rows[0].display_name,
        avatar_url: user.rows[0].avatar_url,
    };
};

export const updatePublicInfo = async (
    db,
    { user_id, display_name, avatar_url }
) => {
    const publicInfo = await db.query(`
        update users set display_name = '${display_name}', avatar_url = '${avatar_url}'
        where id = '${user_id}' returning display_name, avatar_url;
    `);
    if (publicInfo.rowCount == 1) return publicInfo.rows[0];
    else throw new Error("Update failed!");
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
    const chat = await db.query(`
        update users set chats = array_remove(chats, '${chat_id}')
        where id = '${user_id}'
        returning id, display_name, chats, avatar_url;
    `);
    return chat.rows[0];
};

export const removeChats = async (db, { users_id, chat_id }) => {
    const users = await db.query(`
        update users set chats = array_remove(chats, '${chat_id}')
        where id::text in (select unnest(array['${users_id.join(`', '`)}']))
        returning *;
    `);
    return users.rows;
};

export const getUsers = async (db, { users_id }) => {
    const users = await db.query(`
        select id user_id, display_name, avatar_url from users where
        id::text in (select unnest(array['${users_id.join(`', '`)}']));
    `);
    return users.rows;
};

export const searchUsers = async (db, { display_name }) => {
    const friends = await db.query(`
        select id user_id, display_name, avatar_url from users 
        where lower(display_name) like lower('%${display_name}%');
    `);
    return friends.rows;
};

// friends table
export const addFriend = async (db, { user_id, friend_id }) => {
    await db.query(`
        create table if not exists friends
        (user_id uuid, friend_id uuid, status varchar default 'request');
        create index if not exists
        idx_user on friends(user_id);
        create index if not exists
        idx_friend on friends(friend_id);
    `);
    const friend = await db.query(
        `
        insert into friends(user_id, friend_id) values($1, $2)
        returning *;
    `,
        [user_id, friend_id]
    );
    return friend.rows[0];
};

export const acceptRequest = async (db, { user_id, friend_id }) => {
    const request = await db.query(`
        update friends set status='accept' where 
        user_id::text='${friend_id}' and friend_id::text='${user_id}'
        returning *;
    `);
    return request.rows[0];
};

export const refuseRequest = async (db, { user_id, friend_id }) => {
    const request = await db.query(`
        delete from friends where 
        user_id::text='${friend_id}' and friend_id::text='${user_id}' 
        or user_id::text='${user_id}' and friend_id::text='${friend_id}' 
        returning *;
    `);
    return request.rows[0];
};

export const getAllFriends = async (db, { user_id }) => {
    try {
        const friends_info = await db.query(`
            select id user_id, display_name, avatar_url from users
            where id in
            (select user_id from friends where 
            user_id='${user_id}'
            or friend_id='${user_id}'
            union
            select friend_id from friends where 
            user_id='${user_id}'
            or friend_id='${user_id}');
        `);
        const friends = await db.query(`
            select * from friends where 
            user_id='${user_id}'
            or friend_id='${user_id}';
        `);
        return { friends: friends.rows, friends_info: friends_info.rows };
    } catch (e) {
        if (e.message == `relation "friends" does not exist`)
            return { friends: [], friends_info: [] };
    }
};
