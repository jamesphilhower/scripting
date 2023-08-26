import requests
import time

def check_capacity(url, max_connections):
    for num_connections in range(500, max_connections + 1, 10):
        print(f"Testing with {num_connections} connections per second...")
        for _ in range(num_connections):
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    print(f"Successful request: {response.status_code}")
                else:
                    print(f"Failed request: {response.status_code}")
            except Exception as e:
                print(f"Exception: {e}")
        time.sleep(1)

if __name__ == "__main__":
    website_url = "http://localhost:3000"  # Replace this with your actual website URL
    max_connections = 800
    check_capacity(website_url, max_connections)
