
// anonymous immidiate function
(function () {

var express = require('../../');
var app = express();

// anonymous fuction for event handler
app.get('/', function (req, res){
    res.send('Hello World');
});

// anonymous function in object notation
var obj = {
    hello: function () {
        console.log("hello");
    }
};

// anonymous function assigned to variable
var good_morning = function () {
    console.log("good morning");
}

app.listen(3000);
console.log('Express started on port 3000');

})();
