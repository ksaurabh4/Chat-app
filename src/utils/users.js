const users = [];

const addUser = (id, username, room) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //check the existing user
  const existingUser = users.find((user) => {
    return username === user.username && room === user.room;
  });
  if (existingUser) {
    return { error: 'Username is in use!' };
  }

  //storing user in Users
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//remove User

const removeUser = (id) => {
  const index = users.findIndex((user) => id === user.id);
  if (index !== -1) {
    return users.splice(index, 1);
  }
};

//get user by id
const getUser = (id) => {
  const user = users.find((user) => id === user.id);

  if (!user) {
    return { error: 'User not available!' };
  }

  return user;
};

//getUsersInRoom

const getUsersInRoom = (room) => {
  const usersInRoom = users.filter((user) => user.room === room);
  return usersInRoom;
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
