/**
 * name-anonymous-func
 *
 * Add temp name to anonymous function for debugging
 *
 * [sample] This comment is document for class. You can use some HTML tags.
 *
 * @author shibukawa
 *
 * @see https://github.com/shibukawa/name-anonymous-func
 *
 * License: GPL-V3
 */

import "console.jsx";
import "js/nodejs.jsx";
import "getopt.jsx";
import "esprima.jsx";
import "escodegen.jsx";


class FileSystem
{
    static function walk(root : string, callback: (string, string[], string[]) -> void) : void
    {
        if (!node.fs.existsSync(root))
        {
            return;
        }
        var names = node.fs.readdirSync(root);
        var dirs = [] : string[];
        var nextDirs = [] : string[];
        var files = [] : string[];
        for (var i = 0; i < names.length; i++)
        {
            var name = names[i];
            var childPath = node.path.join(root, name);
            var stat = node.fs.statSync(childPath);
            if (stat.isDirectory())
            {
                dirs.push(name);
                nextDirs.push(childPath);
            }
            else if (stat.isFile())
            {
                files.push(name);
            }
        }
        callback(root, dirs, files);
        for (var i = 0; i < nextDirs.length; i++) {
            FileSystem.walk(nextDirs[i], callback);
        }
    }

    static function mkdirp(directory : string) : boolean {
        return FileSystem._mkdirp(node.path.normalize(directory));
    }

    static function _mkdirp(directory : string) : boolean {
        if (node.fs.existsSync(directory)) {
            var stat = node.fs.statSync(directory);
            return stat.isDirectory();
        } else {
            var parentpath = node.path.dirname(directory);
            //var basename = node.path.basename(directory);
            if (FileSystem._mkdirp(parentpath)) {
                node.fs.mkdirSync(directory);
                return true;
            }
            return false;
        }
    }

    static function copyFile(inputPath : string, outputPath : string) : boolean {
        if (inputPath == outputPath)
        {
            return false;
        }
        try
        {
            node.fs.writeFileSync(outputPath, node.fs.readFileSync(inputPath));
            return true;
        }
        catch (e : Error)
        {
            console.error("Can't copy: " + e.toString());
            return false;
        }
    }

    static function splitPath(path : string) : string[] {
        var result = [] : string[];
        while (true)
        {
            result.splice(0, 0, node.path.basename(path));
            var parent = node.path.dirname(path);
            if (parent == '.')
            {
                break;
            }
            else if (parent == '/')
            {
                result.splice(0, 0, parent);
                break;
            }
            path = parent;
        }
        return result;
    }
}

/**
 * [sample] Sample class to use node.js
 */
class NameAnonymousFunc
{
    var counter : int;

    function constructor ()
    {
        this.counter = 0;
    }

    function generateName (name : string = '') : EsprimaIdentifierToken
    {
        var result = ({} : Map.<variant>) as __noconvert__ EsprimaIdentifierToken;
        result.type = "Identfier";
        if (name)
        {
            result.name = "ANONYMOUS_FUNC_" + name + "_" + (this.counter++) as string;
        }
        else
        {
            result.name = "ANONYMOUS_FUNC_" + (this.counter++) as string;
        }
        return result;
    }
    /**
     * @param rootInputDir input directory path
     * @param rootOutputDir output directory path
     */
    function process(rootInputDir : string, rootOutputDir : string, excludes : string[], verbose : boolean) : void
    {
        if (!node.fs.existsSync(rootInputDir))
        {
            console.error("Input directory doesn't exist: " + rootInputDir);
            return;
        }
        FileSystem.walk(rootInputDir, (path, dirs, files) -> {
            var relativeDir = node.path.relative(rootInputDir, path);
            var dirnames = FileSystem.splitPath(relativeDir);
            for (var i = 0; i < dirnames.length; i++)
            {
                if (excludes.indexOf(dirnames[i]) != -1)
                {
                    return;
                }
            }
            var outputDir = node.path.join(rootOutputDir, relativeDir);
            var jsFiles = [] : string[];
            var copyFiles = [] : string[];
            for (var i = 0; i < files.length; i++)
            {
                if (node.path.extname(files[i]) == '.js' && excludes.indexOf(files[i]) == -1)
                {
                    jsFiles.push(files[i]);
                }
                else if (path != outputDir)
                {
                    copyFiles.push(files[i]);
                }
            }
            if (!FileSystem.mkdirp(outputDir))
            {
                throw new Error("can't create directory: " + outputDir);
            }
            for (var i = 0; i < jsFiles.length; i++)
            {
                var inputPath = node.path.join(path, jsFiles[i]);
                var outputPath = node.path.join(outputDir, jsFiles[i]);
                if (verbose)
                {
                    console.log("processing: " + inputPath);
                }
                this.modify(inputPath, outputPath, verbose);
            }
            for (var i = 0; i < copyFiles.length; i++)
            {
                var inputPath = node.path.join(path, copyFiles[i]);
                var outputPath = node.path.join(outputDir, copyFiles[i]);
                if (verbose)
                {
                    console.log("copying: " + inputPath);
                }
                FileSystem.copyFile(inputPath, outputPath);
            }
        });
    }

    function modify(inputPath : string, outputPath : string, verbose : boolean) : void
    {
        var src = node.fs.readFileSync(inputPath, 'utf8');
        var modified = false;
        var ast : EsprimaBlockToken = null;
        try
        {
            ast = esprima.parse(src, {tolerant : true});
        }
        catch (e : Error)
        {
            console.error("parse error: " + e.toString());
        }
        if (ast)
        {
            this.traverse(ast as __noconvert__ Map.<variant>, (functionToken : EsprimaToken, stack : EsprimaToken[]) -> {
                if (functionToken.id)
                {
                    return;
                }
                //console.log(JSON.stringify(functionToken, null, 4));
                if (stack.length > 0)
                {
                    var parent = stack[stack.length -1];
                    if (parent.type == 'Property') {
                        functionToken.id = this.generateName(parent.key.name);
                    }
                    else if (parent.type == 'VariableDeclarator') {
                        functionToken.id = this.generateName(parent.id.name);
                    }
                }
                if (!functionToken.id)
                {
                    functionToken.id = this.generateName();
                }
                modified = true;
            });
        }
        if (modified)
        {
            if (verbose)
            {
                console.log("    writing modified file");
            }
            node.fs.writeFileSync(outputPath, escodegen.generate(ast));
        }
        else
        {
            if (verbose)
            {
                console.log("    copying file (not modified)");
            }
            node.fs.writeFileSync(outputPath, src);
        }
        //node.fs.writeFileSync(outputPath + '.json', JSON.stringify(ast, null, 4));
    }

    function traverse(ast : Map.<variant>, callback : (EsprimaToken, EsprimaToken[]) -> void) : void
    {
        var stack = [] : EsprimaToken[];
        this._traverse(ast, stack, callback);
    }

    function _traverse(ast : Map.<variant>, stack : EsprimaToken[], callback : (EsprimaToken, EsprimaToken[]) -> void) : void
    {
        stack.push(ast as __noconvert__ EsprimaToken);
        for (var key in ast)
        {
            if (ast.hasOwnProperty(key))
            {
                var value = ast[key] as variant;
                if (value instanceof Map.<variant> && value)
                {
                    var map = value as Map.<variant>;
                    if (map['type'] as string == 'FunctionExpression')
                    {
                        callback(map as __noconvert__ EsprimaToken, stack);
                    }
                    this.traverse(map, callback);
                }
                else if (value instanceof variant[])
                {
                    var list = value as variant[];
                    for (var i = 0; i < list.length; i++)
                    {
                        if (list[i] instanceof Map.<variant>)
                        {
                            this.traverse(list[i] as Map.<variant>, callback);
                        }
                    }
                }
            }
        }
        stack.pop();
    }
}

class _Main {
    static function main(argv : string[]) : void
    {
        var parser = new BasicParser('o:(output)e:(exclude)r(replace)q(quite)h(help)', argv);
        var help = false;
        var output = '';
        var replace = false;
        var inputdirs = [] : string[];
        var excludes = ['.git', '.hg', '.svn'];
        var verbose = true;

        var opt = parser.getopt();
        while (opt)
        {
            switch (opt.option)
            {
            case 'h':
                help = true;
                break;
            case 'r':
                replace = true;
                break;
            case 'o':
                output = opt.optarg;
                break;
            case 'e':
                excludes.push(opt.optarg);
                break;
            case 'q':
                verbose = false;
                break;
            default:
                inputdirs.push(opt.option);
            }
            opt = parser.getopt();
        }
        if (help || inputdirs.length != 1 || (output == '' && !replace))
        {
            console.log(
"""name-anonyous-func:

  Add indentical name to anonymous function

command:
    name-anonymous-func [option] inputdir

options:
    -o, --output [output]   : output directory
    -e, --exclude [exclude] : exclude file/directory names
    -r, --replace           : replace existing file
    -q, --quiet             : don't write console
    -h, --help              : show this message
""");
            if (!help)
            {
                if (inputdirs.length == 0)
                {
                    console.log("inputdir is needed");
                }
                else if (inputdirs.length > 1)
                {
                    console.log("only one inputdir is acceptable");
                }
                if (output == '')
                {
                    console.log('output folder or --replace option is needed');
                }
            }
        }
        else
        {
            if (replace)
            {
                output = inputdirs[0];
            }
            var namer = new NameAnonymousFunc();
            namer.process(inputdirs[0], output, excludes, verbose);
        }
    }
}
