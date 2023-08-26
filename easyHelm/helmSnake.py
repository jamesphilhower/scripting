import os
import subprocess
from datetime import datetime

# Command to start your process
def process1():
    try:
        # This is equivalent to 'sleep 5 && echo "Test" && false' in Bash
        subprocess.run(["sleep", "5"], check=True)
        print("Test")
        subprocess.run(["false"], check=True)
    except subprocess.CalledProcessError:
        return False
    return True

# Function to log output
def log(message, log_file):
    with open(log_file, "a") as f:
        timestamped_message = f"{datetime.now()}: {message}\n"
        f.write(timestamped_message)
        print(timestamped_message, end='')

# Directory for the failure count files
fail_count_dir = "./failures"

# Create the directory if it does not exist
os.makedirs(fail_count_dir, exist_ok=True)

# Find the last failure count file and create a new one for this run
fail_files = sorted([f for f in os.listdir(fail_count_dir) if f.startswith("fail_file_")])
last_file = fail_files[-1] if fail_files else None

# Extract the number from the last failure count file and increment it
if last_file:
    number = int(last_file.split("_")[2]) + 1
else:
    number = 1

# Path to the new failure count file
fail_count_file = os.path.join(fail_count_dir, f"fail_file_{number}")

# Write 0 to the new failure count file to initialize it
with open(fail_count_file, "w") as f:
    f.write("0")

# Log file
log_file = os.path.join(os.getcwd(), "process_log.txt")

# Initial call to your process
log("Starting the process...", log_file)

success = process1()

# Initialize failure count
fail_count = 0

# While loop to restart the process if it fails
while not success and fail_count < 10:
    fail_count += 1
    log(f"Process ended with failure, incrementing failure count to {fail_count}...", log_file)
    
    with open(fail_count_file, "w") as f:
        f.write(str(fail_count))

    # Restart the process
    log("Restarting the process...", log_file)
    success = process1()

# If the failure count reaches 10, you can send an email notification here
# You'd need additional libraries like smtplib for sending the email
if fail_count >= 10:
    log("Process has failed 10 times. Implement email sending functionality here.", log_file)

# NOTE: The mail sending part is just a placeholder. You'd have to implement that functionality 
# using Python's libraries like smtplib if required.
