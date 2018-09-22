var mysql = require('mysql');
var inquirer = require('inquirer');
const { table } = require('table');
var data;
var id_select;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3300,
    user: "root",
    password: "root",
    database: "bamazon_DB"
});

function connectDB() {
    
}
    connection.connect(function (err) {
        if (err) throw err;
        console.log("WELCOME TO BAMAZON VALUED CUSTOMER!");
        loadDB()
    })


function loadDB(){
    connection.query("SELECT * FROM inventory", function (err, res) {

            data = [
                ['item_id', 'product_name', 'department_name', 'price', 'stock']
            ];
            for (i = 0; i < res.length; i++) {
                data.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock])
            }
            output = table(data);
            console.log(output);
            inquire();
        })
}

connectDB();

function inquire() {
    inquirer.prompt({
        name: "input",
        message: "What is the ID of the item you want to purchase? (Enter Q to quit)",
    }).then(function (reply) {
        if (reply.input == 'q') {
            process.exit();
        } else {
            id_select = reply.input;
            if ((id_select >= data.length) || isNaN(id_select)) {
                console.log("Please input a valid ID!");
                setTimeout(inquire, 300);
            } else {
                inquirer.prompt({
                    name: "quan",
                    message: "How many would you like to buy?"
                }).then(function (reply) {
                    var temp;
                    if (!isNaN(reply.quan)) {
                        if (reply.quan > data[id_select][4]) {
                            console.log("Purchase quantity exceeds quantity in stock, buying entire inventory!")
                            temp = 0;
                        } else {
                            temp = parseInt(data[id_select][4] - reply.quan);
                        }
                    }
                    connection.query(
                        "UPDATE inventory SET ? WHERE ?",
                        [
                            {
                                stock: temp
                            },
                            {
                                item_id: id_select
                            }
                        ],
                        function (err) {
                            if (err) throw err;
                            console.log("You have purchased " + reply.quan + " of " + data[id_select][1] + "!");
                            loadDB();
                        }
                    )
                })
            }
        }
    })
}