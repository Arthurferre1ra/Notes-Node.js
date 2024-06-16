require("express-async-errors");
const migrationsRun = require("./database/sqlite/migrations");
const AppError = require("./utils/AppError");

const express = require('express'); //IMPORTANDO O EXPRESS
const routes = require("./routes");

migrationsRun();

const app = express(); //INICIALIZANDO O EXPRESS
app.use(express.json()); //Avisando qual utilizar

app.use(routes);

app.use(( error, request, response, next ) => {
    if(error instanceof AppError) {
        return response.status(error.statusCode).json({ status: "error",
            message: error.message
        });
    }

    console.error(error);

    return response.status(500).json({
        status: "error",
        message: "Internal server error",
    });
}) ;

const PORT = 3333 //DEFININDO O NÚMERO DA PORTA QUE A API VAI OBSERVAR
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))