#!/usr/bin/env python3

# python rollup_files.py <directory_name> [-r] [-o output_file_name]
# -r: process files recursively
# -o: output file name (default: output.txt)
import os
import argparse

def rollup(directory, recursive):
    output = []

    for root, dirs, files in os.walk(directory):
        for file in files:
            with open(os.path.join(root, file), 'r') as f:
                content = f.readlines()

            # Comment out relative imports
            content = ['// ' + line if 'import ' in line and './' in line else line for line in content]

            # Add comment indicating original file name
            output.append(f"// Content from: {os.path.join(root, file)}\n")
            output.extend(content)
            output.append("\n\n")

        # If not recursive, break after processing the top directory
        if not recursive:
            break

    return output

def main():
    parser = argparse.ArgumentParser(description="Rollup files into a single file.")
    parser.add_argument("directory", type=str, help="Directory to process")
    parser.add_argument("-r", "--recursive", action="store_true", help="Process files recursively")
    parser.add_argument("-o", "--output", type=str, default="output.txt", help="Output file name")

    args = parser.parse_args()

    if args.directory:
        combined_content = rollup(args.directory, args.recursive)
        with open(args.output, 'w') as outfile:
            outfile.writelines(combined_content)
        print(f"Combined content written to {args.output}")

if __name__ == "__main__":
    main()
