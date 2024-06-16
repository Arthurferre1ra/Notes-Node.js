const { hash, compare } = require("bcryptjs");
const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");

class UsersController {
    async create(request, response) {
        const { name, email, password } = request.body //Desestruturação do codigo

        const database = await sqliteConnection();
        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

        if (checkUserExists) {
            throw new AppError("Este e-mail já está em uso.");
        }

        const hashedPassword = await hash(password, 8)


        await database.run(
            "INSERT INTO users (name, email, password)VALUES (?, ?, ?)", [name, email, hashedPassword]
        )
        
        return response.status(201).json();
    }

    async update(request, response) {
        const { name, email, password, old_password } = request.body;
        const { id } = request.params;

        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

        if (!user) {
            throw new AppError("Usuário não encontrado");
        }

        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new Error("Este e-mail já está em uso.");
        }

        if (password && old_password) {
            const checkOldPassword = await compare(old_password, user.password);

            if (!checkOldPassword) {
                throw new AppError("A senha antiga está incorreta.");
            }

            user.password = await hash(password, 8);
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if (password && !old_password) {
            throw new AppError("Você precisa informar a senha antiga para definir a nova senha.")
        }

        await database.run(`
        UPDATE users SET
        name = ?,
        email = ?,
        password = ?,
        updated_at = DATETIME('now') 
        WHERE id = ?`,
        [user.name, user.email, user.password, id]
        );


        return response.json();

    }

}

module.exports = UsersController;

/*
* index - GET para listar varios registros.
* show - GET para exibir um registro especifico.
* create - POST para criar um registro.
* update - PUT para atualizar um registro.
* delete - DELETE para remover um registro.
*/