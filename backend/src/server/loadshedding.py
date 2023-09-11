import os
from server.database import DatabaseController
import http.client


class Loadshedding:
    interval = 1800
    endpoints = [
        "/business/2.0/area?id={area_id}&test=current",  # this is the testing command
        "/business/2.0/area?id={area_id}",
        # Add more endpoints if needed
    ]
    regions = [
        "capetown-15-universityofcapetown",
        # Add more regions as needed
    ]
    # load_dotenv()
    key = os.environ.get("ESP_license_key")

    @staticmethod
    def update_loadsheding_schedule(region, app_current):
        host = "developer.sepush.co.za"
        areaid = Loadshedding.regions[region - 1]
        path = Loadshedding.endpoints[0].replace("{area_id}", areaid)
        token = Loadshedding.key
        conn = http.client.HTTPSConnection(host)
        headers = {"token": token}
        conn.request("GET", path, headers=headers)
        response = conn.getresponse()
        if response.status == 200:
            response_data = response.read().decode("utf-8")
            DatabaseController.get().update_loadshedding_schedule(region, response_data)

        else:
            print(f"Request failed with status code {response.status}")
        conn.close()

    @staticmethod
    def testing():
        print("test")
