const minRoles = {
    products:{
        get: 1000,
        post: 1000,
        put: 1000,
        delete: 5000,
    },
    users:{
        get: 1000,
        post: 1000,
        put: 1000,
        delete: 1000,
    },
    uploads:{
        post: 1000,
        delete: 1000,
    },
    sales:{
        get: 1000,
        post: 1000,
        put: 1000,
        delete: 5000,
    },
    saleProducts:{
        get: 1000,
        post: 1000,
        put: 1000,
        delete: 5000,
    }
}

module.exports = {minRoles}