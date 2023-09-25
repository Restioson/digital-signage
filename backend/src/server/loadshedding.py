import os
from server.database import DatabaseController
import http.client
import flask


class Loadshedding:
    """This class handles the backend Loadshedding process which is calling the ESP API
    and getting the information an storing it in the database.
    Right now the system is configured to only fetch information for the UCT area
    but this has been built for later alteration of multiple areas"""

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
    key = os.environ.get("ESP_LICENSE_KEY")
    # this is the license key that is stored in the .env file

    @staticmethod
    def update_loadshedding_schedule(region, app_current):
        host = "developer.sepush.co.za"
        areaid = Loadshedding.regions[region - 1]
        if flask.current_app.config["TESTING"]:
            path = Loadshedding.endpoints[0].replace("{area_id}", areaid)
        else:
            path = Loadshedding.endpoints[1].replace("{area_id}", areaid)
            # when doing demos or final product switch the above line to "endpoints[1]"
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
