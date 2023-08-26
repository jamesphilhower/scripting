const fs = require('fs');
const path = require('path');
const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require('escodegen');

// Helper function to get all JavaScript files in a directory recursively
const getJavaScriptFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getJavaScriptFiles(file)); // Recursion
        } else {
            if (path.extname(file) === '.js') {
                results.push(file);
            }
        }
    });
    return results;
};


const analyzeJS = (code, filePath) => {
    const ast = esprima.parseModule(code, { comment: true, tokens: true, range: true });

    const functionDeclarations = {};
    const functionInvocations = {};
    let callGraph = {};

    // First pass: Gather functions
    // First pass: Gather functions and their callers
    estraverse.traverse(ast, {
        enter: (node, parent) => {
            if (node.type === 'FunctionDeclaration') {
                const functionName = node.id?.name ?? "*locally defined function*";
                functionDeclarations[functionName] = { node: node, parent: parent, invokedBy: [] };
            }
        }
    });

    estraverse.traverse(ast, {
        enter: (node, parent) => {
            if (node.type === 'FunctionDeclaration') {
                currentFunctionName = node.id?.name ?? "*locally defined function*";
            } else if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
                const calleeFuncName = node.callee.name;
                if (calleeFuncName in functionDeclarations) {
                    functionInvocations[calleeFuncName] = functionInvocations[calleeFuncName] || [];
                    functionInvocations[calleeFuncName].push(currentFunctionName); // Record caller's name
                }
            }
        },
        leave: (node, parent) => {
            if (node.type === 'FunctionDeclaration') {
                currentFunctionName = "*locally defined function*"; // Reset the current function name after leaving
            }
        }
    });

    // Function to recursively find paths leading to a function invocation
    function findPathsToFunction(funcName) {
        let seen = new Set();
        if (!functionInvocations[funcName]) return [];

        const paths = new Set();
        const stack = [];

        // Initialize the stack with the initial callers and their current paths
        for (const caller of functionInvocations[funcName]) {
            console.log("adding caller", caller)
            // avoid infinite loop
            if (caller == funcName) { paths.add("*locally defined function*"); continue; }
            stack.push({ caller, path: [caller] });
        }

        while (stack.length > 0) {
            const { caller, path } = stack.pop();
            console.log("caller", caller, "path", path)
            if (seen.has(path)) continue;
            if (!functionInvocations[caller]) {
                // Reached a leaf node, add the path to the paths array
                seen.add(path)
                paths.add(path.join(" -> "));
            } else {
                // Push the next callers and their updated paths onto the stack
                for (const nextcaller of functionInvocations[caller]) {
                    // adding reversed
                    let newPath = [nextcaller, ...path]
                    if (nextcaller == caller) continue;
                    stack.push({ caller: nextcaller, path: newPath });
                }
            }
        }

        return [...paths];
    }


    // Analyze function usages
    let output = {};


    for (const [funcName, { node, parent, invokedBy }] of Object.entries(functionDeclarations)) {
        const invocations = functionInvocations[funcName] || [];
        // const invocationstwo = callGraph[funcName] || [];

        console.log("------------------" + funcName + "------------------")
        console.log("invocations", invocations)
        // console.log("callGraph", invocationstwo)

        const paths = findPathsToFunction(funcName)
        console.log("Paths", paths)
        console.log("------------------")


        if (invocations.length === 0) {
            // console.log(`Function ${funcName} has no invocations.`);

            // Comment out function and add explanation
            const comment = {
                type: 'Block',
                value: `Function ${funcName} was commented out because no one called it.`
            };
            // TODO: 
            // parent.body = parent.body.map(item => item === node ? { type: 'BlockStatement', body: [node], leadingComments: [comment] } : item);
            output[funcName] = 'Not called by anyone';
        } else if (invocations.length === 1 && invocations.every(invocation => invocation === invocations[0])) {
            // Move function to invocation site
            const invocationNode = invocations[0];
            const comment = {
                type: 'Block',
                value: `Function ${funcName} was moved here because of single invocation.`
            };

            // Create a new block containing the function and add it before the invocation node
            const newBlock = {
                type: 'BlockStatement',
                body: [node],
                leadingComments: [comment]
            };

            // Replace the invocation node with the new block in the parent body
            parent.body = parent.body?.map(item => (item === invocationNode) ? newBlock : item);

            // Update output with information
            output[funcName] = 'Moved to a single invocation site';
        } else {
            // Comment the number of times the function is used
            const comment = {
                type: 'Block',
                value: `Function ${funcName} is used at ${invocations.length} locations.`
            };
            node.leadingComments = node.leadingComments || [];
            node.leadingComments.push(comment);
            output[funcName] = `Called by ${invocations.length} entities`;
        }
    }

    estraverse.attachComments(ast, ast.comments, ast.tokens);

    // Generate the new JavaScript code
    const newCode = escodegen.generate(ast, { comment: true });

    return { newCode, output };
};

// Process command-line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error("Please provide the input file path as an argument.");
    process.exit(1);
}
const inputPath = args[0];
const outputPath = args[1] || 'output.js'; // Default output file path

function processFiles(inputPath, outputPath) {
    if (fs.existsSync(inputPath)) {
        const stats = fs.statSync(inputPath);
        if (stats.isFile()) {
            // Process single file
            const code = fs.readFileSync(inputPath, 'utf-8');
            const { newCode, output } = analyzeJS(code, inputPath);
            fs.writeFileSync(outputPath, newCode); // Write to the output file
            let sortedOutput = Object.entries(output)
                .sort(([, val1], [, val2]) => {
                    const num1 = parseInt(val1.split(' ')[2] || 0);
                    const num2 = parseInt(val2.split(' ')[2] || 0);
                    return num1 - num2;
                })
                .reduce((acc, [key, val]) => {
                    acc[key] = val;
                    return acc;
                }, {});
        } else if (stats.isDirectory()) {
            // Process directory
            const files = getJavaScriptFiles(inputPath);
            files.forEach((filePath) => {
                const relativePath = path.relative(inputPath, filePath);
                const outputPathForFile = path.join(outputPath, relativePath);

                const code = fs.readFileSync(filePath, 'utf-8');
                const { newCode, output } = analyzeJS(code, filePath);

                // Create the directory if it doesn't exist
                const outputDir = path.dirname(outputPathForFile);
                fs.mkdirSync(outputDir, { recursive: true });

                // Write the modified content to the corresponding file in the output directory
                fs.writeFileSync(outputPathForFile, newCode);
            });
        }
    }
}

processFiles(inputPath, outputPath);
