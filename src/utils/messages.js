const generateMassage = (Username, text) => {
    return {
        Username,
        text,
        createdAt: new Date().getTime()
}
}

const generateLocationMassage = (Username, text) => {
    return {
        Username,    
        text,
        createdAt: new Date().getTime()
}
}

module.exports = {
    generateMassage,generateLocationMassage
}