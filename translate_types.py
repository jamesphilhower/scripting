import re
import sys

def extract_functions_with_types(filename, is_ts=False):
    with open(filename, 'r') as f:
        content = f.read()

        # Extract function names with their params and types if they exist
        # This regular expression captures functions in the format of "function funcName(param:type)"
        pattern = r'function (\w+)\(([^)]*)\)' if is_ts else r'function (\w+)\(([^)]*)\)'
        
        return dict(re.findall(pattern, content))

def add_types_to_js(js_content, ts_functions):
    recheck_list = []
    for func, ts_params in ts_functions.items():
        params = ts_params.split(',')
        ts_param_with_types = [param.strip() for param in params]
        
        # Replace JS functions with TS function definitions
        for param_with_type in ts_param_with_types:
            # Check for "any" type
            if ': any' in param_with_type:
                recheck_list.append(func)

            js_content = re.sub(
                rf'function {func}\(([^)]*)\)',
                f'function {func}({ts_params})',
                js_content
            )
    
    return js_content, recheck_list

def main():
    if len(sys.argv) != 3:
        print("Usage: python script_name.py source.js types.ts")
        return

    js_file = sys.argv[1]
    ts_file = sys.argv[2]

    with open(js_file, 'r') as f:
        js_content = f.read()
    
    ts_functions = extract_functions_with_types(ts_file, is_ts=True)
    
    modified_js, recheck_functions = add_types_to_js(js_content, ts_functions)
    
    with open("typed_translation.ts", 'w') as f:
        f.write(modified_js)
    
    if recheck_functions:
        print("Please recheck the types for the following functions:")
        for func in recheck_functions:
            print(f"- {func}")

if __name__ == '__main__':
    main()
