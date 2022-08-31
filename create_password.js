const bcrypt = require("bcryptjs");

const password = "xRRa8sfTFlxGHOYWxJff"

async function generate_hash(){
    console.log(await bcrypt.hash(process.argv[2] || password, 12));
}


generate_hash();
