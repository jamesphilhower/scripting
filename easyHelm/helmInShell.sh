#!/bin/bash

# Command to start your process
process1() {
    sleep 5 && echo "Test" && false
}

# Directory for the failure count files
fail_count_dir="./failures"

# Create the directory if it does not already exist
# "-p" option makes intermediate directory as needed
mkdir -p $fail_count_dir

# Find the last failure count file and create a new one for this run
# "ls" lists the files in a directory
# "grep" filters out the files matching the pattern "fail_file_"
# "sort" sorts the filtered files. "-n" option sorts by numerical order, "-t _" option specifies underscore as delimiter and "-k 3" option specifies the third field as sort key
# "tail -1" gives the last file in the sorted list which is the last failure count file
last_file=$(ls $fail_count_dir | grep fail_file_ | sort -n -t _ -k 3 | tail -1)

# Extract the number from the last failure count file and increment it
# "cut -d _ -f 3" extracts the third field which is the number from the file name
number=$(echo $last_file | cut -d _ -f 3)
if [ -z "$number" ]; then
    number=1
else
    number=$(( $number + 1 ))
fi

# Path to the new failure count file
fail_count_file="$fail_count_dir/fail_file_$number"

# Write 0 to the new failure count file to initialize it
echo 0 > $fail_count_file

# Log file
log_file="$(pwd)/process_log.txt"

# Function to log output to the logfile
# "tee -a $log_file" writes the input to standard output and appends it to the log file
log() {
    echo "$(date): $1" | tee -a $log_file
}

# Initial call to your process
log "Starting the process..."
process1
ret_val=$?

# Initialize failure count
fail_count=0

# While loop to restart the process if it fails
# The loop continues until the failure count reaches 10 or the process succeeds
while [ $fail_count -lt 10 ]  && [ $ret_val -ne 0 ]; do
    echo $fail_count
    # The process has ended, increment the fail count
    fail_count=$(( $fail_count + 1 ))
    log "Process ended with exit status $ret_val, incrementing failure count..."
    echo $fail_count > $fail_count_file

    # Restart the process
    log "Restarting the process..."
    process1
    ret_val=$?
done

# If the failure count reaches 10, send an email notification
# Replace "youremail@example.com" with your actual email address
if [ $fail_count -ge 10 ]; then
    log "Process has failed 10 times, sending email notification..."
    echo "The process has failed 10 times." | mail -s "Process failure" "youremail@example.com"
fi
