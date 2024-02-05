(function (root, factory) {
    console.log("elmaLib connected")
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.returnExports = factory(root.b);
    }
}(this, function (b) {
    // private
    function _sum(x, y) { return x + y };
    // public
    async function getUsersFromRole(roles) {
        if (!roles?.length) return;
        let users = [];
        // Получаем пользователей этого элемента (Роль)
        for (let i of roles) {//так как Роль это массив зачем-то с одним значением
            const id = i.code
            if (i.type === 'group') {// Это группа
                const group = await System.userGroups.search().where((a) => a.__id.eq(id)).first();
                if (group) {
                    const groupMembers = await group.users()
                    users = [...users, ...groupMembers]
                    const subGroups = await group.subGroups()
                    for (let group of subGroups) {
                        const getUsers = await group.users();
                        users = [...users, ...getUsers]
                    }
                }
            }
            else if (i.type === 'user') {// Это пользователь
                const getUsers = await i.getUsers();
                users = [...users, ...getUsers]
            }
            else if (i.type === 'orgstruct') {// Это оргструктура   
                const position_from_id = (await System.organisationStructure.fetchTree()).getRoot().find(x => x.id === id);
                const employee = await System.users.search().where(x => x.osIds.has(position_from_id)).size(10000).all();
                users = [...users, ...employee]
            }
        }
        return users;
    }

    // export necessary
    return {
        getUsersFromRole:getUsersFromRole,
        name: "elmaLib"
    }
}));