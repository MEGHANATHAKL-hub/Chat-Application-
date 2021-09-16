const users = []

const addUsers = ({ id, Username, Room }) => {
    // Clean the data
    console.log(Username);
    Username = Username.trim().toLowerCase()
    Room = Room.trim().toLowerCase()

    // Validate the data
    if (!Username || !Room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.Room === Room && user.Username === Username
    })

    // Validate Username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, Username, Room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (Room) => {
    Room = Room.trim().toLowerCase()
    return users.filter((user) => user.Room === Room)
}

module.exports = {
    addUsers,
    removeUser,
    getUser,
    getUsersInRoom
}