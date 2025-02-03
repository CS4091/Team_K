const Pool = require('pg').Pool

require('dotenv').config()
const user = process.env.db_user
const host = process.env.db_host
const database = process.env.db_database
const password = process.env.db_password
const port = process.env.db_port
const pool = new Pool ({
    user, host, database, password, port
})


const getPosts = async () => {
    try {
        return await new Promise(function (resolve, reject){
            pool.query("SELECT * FROM posts", (error, results) => {
                if(error) {
                    reject(error)
                }
                if (results && results.rows){
                    resolve(results.rows)
                } else {
                    reject(new Error("No results found"))
                }
            })
        })
    } catch (error_1){
        console.error(error_1)
        throw new Error("Internal server error")
    }
}


module.exports = {
    getPosts
}