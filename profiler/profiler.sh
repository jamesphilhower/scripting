#!/bin/bash

url="https://localhost:5173"  # Replace with your website's URL

total_requests=10  # Total number of requests
concurrent_requests=2  # Number of concurrent requests
output_file="output.log"  # Output log file

# Initialize counters
total_time=0
success_count=0
failure_count=0

for ((i=1; i<=total_requests; i++)); do
    echo "Sending request $i"
    
    # Send the request and capture the output
    response=$(curl -k -s -w "%{time_total} %{http_code}" -o /dev/null $url)
    # Extract the time and status from the response
    time=$(echo $response | awk '{print $1}')
    status=$(echo $response | awk '{print $2}')

    # Update the total time
    total_time=$(echo "$total_time + $time" | bc)
    echo $total_time
    # Update the success and failure counts based on the status code
    if [[ $status -ge 200 && $status -lt 400 ]]; then
        ((success_count++))
    else
        ((failure_count++))
    fi

    echo $response >> $output_file  # Log the output

    # If we've hit the concurrency limit, wait for all background processes to finish
    if (( i % concurrent_requests == 0 )); then
        wait
    fi
done

# Wait for any remaining background processes to finish
wait

# Calculate the average time
average_time=$(echo "scale=4; $total_time / $total_requests" | bc)

echo "Total requests: $total_requests" 
echo "Successful requests: $success_count" 
echo "Failed requests: $failure_count" 
echo "Average time per request: $average_time seconds" 
