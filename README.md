add-func-name
===========================================

Synopsis
---------------

Add temp name to anonymous function for debugging.

Motivation
---------------

Google Chrome's developer tool is awesome, but it is difficult to find where the closure is created?
This tool save your time for reducing memory leak and debugging.

This tool adds names to anonymous functions.

Installation
---------------

```sh
$ npm install add-func-name
```

Usage
---------------

```sh
$ add-func-name [option] input_folder
```

### option

* `-e name`, `--exclude=name`

   Filter file or/and folder by name. You can use this option several times.

* `-o`, `--output`

    Output folder

* `-r`, `--replace`

    Replace exisiting source code.

* `-q`, `--quiet`

    Stop console output

* `-h`, `--help`

    Display help

Usage Sample
-------------------

```js
$ add-func-name -e node_modules -o sample_output sample
```

Sample Output
-------------------

### Sample Input

```js
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
```

### Sample Output

It uses esprima and it removes comment. So resulting files don't have comment.

```js
(function ANONYMOUS_FUNC_0() {
    var express = require('../../');
    var app = express();
    app.get('/', function ANONYMOUS_FUNC_1(req, res) {
        res.send('Hello World');
    });
    var obj = {
            hello: function ANONYMOUS_FUNC_hello_2() {
                console.log('hello');
            }
        };
    var good_morning = function ANONYMOUS_FUNC_good_morning_3() {
        console.log('good morning');
    };
    app.listen(3000);
    console.log('Express started on port 3000');
}());
```

Development
-------------

## JSX

Don't be afraid [JSX](http://jsx.github.io)! If you have an experience of JavaScript, you can learn JSX
quickly.

* Static type system and unified class syntax.
* All variables and methods belong to class.
* JSX includes optimizer. You don't have to write tricky unreadalbe code for speed.
* You can use almost all JavaScript API as you know. Some functions become static class functions. See [reference](http://jsx.github.io/doc/stdlibref.html).

## Setup

To create development environment, call following command:

```sh
$ npm install
```
## Repository

* Repository: git://github.com/shibukawa/add-func-name.git
* Issues: https://github.com/shibukawa/add-func-name/issues

## Run Test

```sh
$ grunt test
```

## Build

```sh
# Build application or library for JS project
$ grunt build

# Generate API reference
$ grunt doc

```

Author
---------

* shibukawa / yoshiki@shibu.jp

License
------------

GPL-V3

Complete license is written in `LICENSE.md`.

Thanks
-----------

* esprima
* escodegen
* JSX
* grunt-jsx
* grunt
