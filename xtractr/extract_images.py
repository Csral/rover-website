"""

You need your auth tokens if extracting from google drive.

Do NOT auto load env via modules, you will get diddled

"""

import subprocess
import os

content = []
try:
    with open(".env") as reader:
        content = reader.readlines()
except IOError:
    print("Place creds gng.")

cookies = ""
useragent = ""

def extract():
    global content, cookies, useragent

    for x in content:

        x = x.strip()

        if not x or x.startswith("#"):
            continue

        if "=" not in x:
            print("Fix yo env gng")
            exit(1)

        key, value = x.split("=", 1)
        key = key.strip().lower()
        value = value.strip()

        if key == 'cookies':
            cookies = value
        elif key == 'useragent':
            useragent = value
        else:
            print(f"Ignoring unknown key {key}")

extract()

if not (cookies and useragent):
    print("Invalid config maybe? Can't fetch cookies and useragent!")
    exit(1)

import pandas as pd
df = pd.read_csv('items.csv')

images_col = 'Desired Picture for the Profile'
names_col = 'Full Name'

if images_col not in df.columns:
    print("No images column!")
    exit(1)

if names_col not in df.columns:
    print("No name column!")
    exit(1)

images = (
    df.dropna(subset=[names_col, images_col])
      .set_index(names_col)[images_col]
      .to_dict()
)


os.makedirs('output', exist_ok=True)

from urllib.parse import urlparse, parse_qs

for name, url in images.items():

    name = name.strip()
    file_id = parse_qs(urlparse(url).query)["id"][0]
    url = f"https://drive.usercontent.google.com/u/2/uc?id={file_id}&export=download"

    cmd = [
        "curl", "-L", "--fail-with-body", url,
        "-H", f"User-Agent: {useragent}",
        "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "-H", "Accept-Language: en-US,en;q=0.9",
        "-H", "Accept-Encoding: gzip, deflate, br, zstd",
        "-H", "Referer: https://drive.google.com/",
        "-H", "Alt-Used: drive.usercontent.google.com",
        "-H", "Connection: keep-alive",
        "-H", f"Cookie: {cookies}",
        "-H", "Upgrade-Insecure-Requests: 1",
        "-H", "Sec-Fetch-Dest: document",
        "-H", "Sec-Fetch-Mode: navigate",
        "-H", "Sec-Fetch-Site: same-site",
        "-H", "Sec-Fetch-User: ?1",
        "-H", "Sec-GPC: 1",
        "-H", "DNT: 1",
        "-H", "Priority: u=4",
        "-H", "Pragma: no-cache",
        "-H", "Cache-Control: no-cache",
        "-H", "TE: trailers",
        "-o", os.path.join("output", f"{name}.png"),
    ]

    try:
        subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True,
        )

        print(f"Obtained {name}")
        
    except subprocess.CalledProcessError as e:
        print(f"Failed for {name}.")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        print(f"CODE: {e.returncode}")