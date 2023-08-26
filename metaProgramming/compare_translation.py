import re
import sys

def extract_functions(filename):
    with open(filename, 'r') as f:
        content = f.read()
        # This regular expression captures the pattern "function [word]"
        return set(re.findall(r'function (\w+)', content))

def main():
    if len(sys.argv) != 3:
        print("Usage: python script_name.py file1.txt file2.txt")
        return

    file1 = sys.argv[1]
    file2 = sys.argv[2]
    
    functions_in_file1 = extract_functions(file1)
    functions_in_file2 = extract_functions(file2)
    
    # Find the differences
    only_in_file1 = functions_in_file1 - functions_in_file2
    only_in_file2 = functions_in_file2 - functions_in_file1
    
    if not only_in_file1 and not only_in_file2:
        print("Both files have the same set of functions.")
        return
    
    if only_in_file1:
        print(f"Functions only in {file1}:")
        for func in only_in_file1:
            print(f"- {func}")
            
    if only_in_file2:
        print(f"\nFunctions only in {file2}:")
        for func in only_in_file2:
            print(f"- {func}")

if __name__ == '__main__':
    main()
