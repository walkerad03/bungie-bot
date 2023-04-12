import sys

import requests

HEADERS = {"X-API-KEY": "9cbbb19d011d4dc2b42e1ebc297ea04d"}

def get_lowmans_by_username(username: str):
    foundMembershipDetails = False

    username, number = username.split(sep="#")
    page = 0
    req_str = f"https://www.bungie.net/Platform/User/Search/GlobalName/{page}/"
    json_data = {"displayNamePrefix": username}

    res = requests.post(url=req_str, json=json_data, headers=HEADERS).json()

    while 'Response' in res and not foundMembershipDetails:
        for result in res['Response']['searchResults']:
            if result['bungieGlobalDisplayNameCode'] == int(number):
                foundMembershipDetails = True
                for each in result['destinyMemberships']:
                    mem_id, mem_type = each['membershipId'], each['membershipType']
                    _get_lowmans_for_member(mem_type=mem_type, mem_id=mem_id)
        
        page += 1
        req_str = f"https://www.bungie.net/Platform/User/Search/GlobalName/{page}/"
        res = requests.post(url=req_str, json=json_data, headers=HEADERS).json()

def _get_lowmans_for_member(mem_type: str, mem_id: str):
    char_req_str = f"https://www.bungie.net/Platform/Destiny2/{mem_type}/Account/{mem_id}/Stats/"
    chars = requests.get(char_req_str, headers=HEADERS).json()

    for char in chars['Response']['characters']:
        selected = char["characterId"]

        path = f"https://www.bungie.net/Platform/Destiny2/{mem_type}/Account/{mem_id}/Character/{selected}/Stats/Activities/?page=0&mode=raid&count=250"

        res = requests.get(path, headers=HEADERS).json()

        if 'activities' in res['Response']:
            for act in res['Response']['activities']:
                if act['values']['playerCount']['basic']['value'] <= 3 and act['values']['completed']['basic']['value'] == 1:
                    hash_val = act['activityDetails']['directorActivityHash']

                    new_path = f"https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityDefinition/{hash_val}"

                    raid_def = requests.get(new_path, headers=HEADERS).json()

                    print(f"{raid_def['Response']['displayProperties']['name']}")
                    print(f"{raid_def['Response']['displayProperties']['description']}")
                    print(f"Date: {act['period']} // Fireteam Size: {int(act['values']['playerCount']['basic']['value'])}\n")
                    sys.stdout.flush()

username = sys.argv[1]
get_lowmans_by_username(username)