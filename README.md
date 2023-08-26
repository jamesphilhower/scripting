# JavaScript Code Analyzer and Modifier

This tool provides an analysis and modification utility for JavaScript code. The primary goal is to identify functions that are not called or are singularly invoked, and take appropriate actions such as commenting out or relocating.

## Features

1. **Function Call Tracking:** Recognizes all function declarations and their invocations throughout the codebase.
2. **Function Redundancy Handling:** If a function is never invoked, it gets commented out with a note indicating the reason.
3. **Function Relocation:** If a function is only invoked from one location, it gets moved closer to the invocation site.
4. **Function Call Count Comment:** For functions that have multiple invocations, a comment is added specifying the number of call sites.

## Dependencies

- `fs` and `path`: For file and directory operations.
- `esprima`: For parsing JavaScript and creating an Abstract Syntax Tree (AST).
- `estraverse`: For traversing the AST.
- `escodegen`: For generating new JavaScript code from the modified AST.

## Usage

### Command-Line

```bash
node <script_name.js> <input_path> [output_path]
```

- `<script_name.js>`: The name of this script.
- `<input_path>`: Path to the input JavaScript file or directory. (Required)
- `<output_path>`: Path to the output JavaScript file or directory. Default is `monolith_ified.js`.

### API Overview

1. `getJavaScriptFiles(dir)`: Recursively retrieves all JavaScript files in a directory.
2. `analyzeJS(code, filePath)`: Analyzes a JavaScript file, modifies based on function call patterns, and returns the modified code.
3. `processFiles(inputPath, outputPath)`: Processes either a single file or a directory of JavaScript files, applying the analyzeJS function on each.

## Examples

For a single file:

```bash
node <script_name.js> path/to/input_file.js path/to/output_file.js
```

For a directory:

```bash
node <script_name.js> path/to/input_directory path/to/output_directory
```

If no output path is provided, it defaults to `monolith_ified.js`.

## Caveats and Limitations

- This tool assumes that the provided JavaScript code is module-based (as it uses `parseModule` from `esprima`). 
- Function relocations are based on a single invocation site and might not be suitable for all use-cases.
- Recursive functions are not considered in the analysis.
  
  
  ---

## JavaScript to TypeScript Function Signature Translator

This utility is designed to assist developers in translating their JavaScript function signatures to TypeScript signatures. By reading function declarations from a TypeScript (`.ts`) file, this script overlays the type annotations onto the corresponding JavaScript functions.

### Features

1. **TypeScript Signature Extraction:** Extracts function signatures, including type annotations, from a provided TypeScript file.
2. **JavaScript Function Transformation:** Transforms JavaScript functions by adding the TypeScript type annotations.
3. **Auto Warning Generation:** Automatically warns the user if any function parameter is given the `any` type, suggesting a manual review.

### Dependencies

- `re`: For regular expression pattern matching operations.
- `sys`: To access command-line arguments.

### Usage

#### Command-Line

```bash
python script_name.py source.js types.ts
```

- `script_name.py`: The name of this utility script.
- `source.js`: The source JavaScript file you wish to modify with TypeScript signatures.
- `types.ts`: The TypeScript file from which function signatures will be extracted.

### Output

The modified JavaScript, now with TypeScript function signatures, will be written to a file named `typed_translation.ts`. 

If there are functions with the `any` type, the script will also provide a list of those functions, prompting the user to review and specify a more appropriate type.

### Example

If `types.ts` has the function:

```typescript
function greet(name: string, age: number): void
```

And `source.js` has the function:

```javascript
function greet(name, age)
```

The output `typed_translation.ts` will contain:

```typescript
function greet(name: string, age: number)
```

### Caveats and Limitations

- The tool assumes that the provided TypeScript and JavaScript files are well-structured and that function names are unique across files.
- Only function declarations using the `function` keyword are currently processed.
- Any function with the `any` type is flagged for manual review.
  
---

Feel free to adjust the content as necessary to better fit your project or specific use case.


---

## File Rollup Utility

This utility consolidates multiple files into a single output file, allowing developers to merge the content of individual files from a directory into one aggregated file. Especially useful for combining configuration, scripts, or other textual data.

### Features

1. **Commented Import Handling:** Lines with relative imports are automatically commented out to prevent errors in the combined file.
2. **File Origin Comments:** Each section from an individual file is prefaced with a comment indicating its original source file, aiding in the identification of content origins.
3. **Recursive Option:** Provides an option to process files not only in the specified directory but also in its subdirectories.
4. **Customizable Output Filename:** By default, the tool will generate `output.txt`, but users can specify a different output filename if needed.

### Dependencies

- `os`: For interacting with the operating system to read directory structures and file content.
- `argparse`: To handle command-line arguments effectively.

### Usage

#### Command-Line

```bash
python rollup_files.py <directory_name> [-r] [-o output_file_name]
```

**Parameters:**

- `<directory_name>`: The name of the directory containing files you wish to consolidate.
- `-r, --recursive`: Process files recursively from the specified directory and its subdirectories.
- `-o, --output`: The desired output file name (default: `output.txt`).

### Output

A single file containing the aggregated content of all processed files, with comments indicating the source of each segment.

### Example

Given a directory structure:

```
/config
   |-- config1.txt
   |-- config2.txt
   |-- /nested
         |-- config3.txt
```

Running the command:

```bash
python rollup_files.py config -r -o aggregated_config.txt
```

Will produce `aggregated_config.txt` with content from all the files (`config1.txt`, `config2.txt`, and `config3.txt`), and commented indications of their origin.

### Caveats and Limitations

- The utility comments out relative imports (`import ... from './...'`) to prevent potential issues in the combined file. Ensure you manually review and adjust as needed.
- The order of content in the output file is influenced by the file system's order of reading files. It's important to review the output to ensure the sequence meets your requirements.
  
---

Adjust the content as needed to better fit your project or specific context.


---

## Function Difference Checker Utility

This utility analyzes two files to identify differences in the set of functions they contain. It lists out the names of functions that are exclusively present in each file, aiding in codebase analysis, refactoring, or code review processes.

### Features

1. **Easy Comparison:** Quickly compare two files to find out which functions are unique to each.
2. **Simple Output:** The output is straightforward, listing the function names that are unique to each file.
3. **File Agnostic:** While designed for source code files, this utility can technically read any text files where the function definitions follow the pattern `function functionName`.

### Dependencies

- `re`: Regular expression library for pattern matching.
- `sys`: For command-line arguments.

### Usage

#### Command-Line

```bash
python script_name.py file1.txt file2.txt
```

**Parameters:**

- `file1.txt`: The first file you wish to compare.
- `file2.txt`: The second file you wish to compare.

### Output

The utility will output the list of functions that are unique to each file. If both files contain the same set of functions, a message indicating so will be displayed.

### Example

Suppose `file1.txt` contains:

```javascript
function foo() { ... }
function bar() { ... }
```

And `file2.txt` contains:

```javascript
function foo() { ... }
function baz() { ... }
```

Running the command:

```bash
python script_name.py file1.txt file2.txt
```

Will produce:

```
Functions only in file1.txt:
- bar

Functions only in file2.txt:
- baz
```

### Caveats and Limitations

- The utility assumes that the function definitions follow the pattern `function functionName`. Variations like arrow functions in JavaScript won't be captured.
- It is case-sensitive, so `function Foo` and `function foo` would be considered different.

---

Feel free to adjust the content to better suit your project or specific context.