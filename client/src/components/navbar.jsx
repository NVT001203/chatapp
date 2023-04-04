/* eslint-disable react-hooks/exhaustive-deps */

function Navbar({ data }) {
    const { setHidden, currentChat, currentUser, store } = data;

    return (
        <div className="navbar">
            <div className="wrapper">
                <div
                    className="chat-avatar"
                    style={{
                        backgroundImage: `url(${
                            !currentChat.is_group
                                ? currentChat.members[0] != currentUser.user_id
                                    ? store.users[currentChat.members[0]]
                                          .avatar_url
                                    : store.users[currentChat.members[1]]
                                          .avatar_url
                                : currentChat.chat_avatar ||
                                  "https://cdn3.vectorstock.com/i/1000x1000/24/27/people-group-avatar-character-vector-12392427.jpg"
                        })`,
                    }}
                ></div>
                <div className="navbar-content">
                    <span>
                        {!currentChat.is_group
                            ? currentChat.members[0] != currentUser.user_id
                                ? store.users[currentChat.members[0]]
                                      .display_name
                                : store.users[currentChat.members[1]]
                                      .display_name
                            : currentChat.name ||
                              `${currentChat.members.map(
                                  (id) => `${store.users[id].display_name} `
                              )}`}
                    </span>
                </div>
            </div>
            <div className="more-wrapper">
                <div className="icon video"></div>
                <div className="icon phone"></div>
                <div
                    className="icon more"
                    onClick={() => setHidden((pre) => !pre)}
                ></div>
            </div>
        </div>
    );
}

export default Navbar;
