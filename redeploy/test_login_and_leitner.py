

import requests
import json
import configparser
import pytest
import os

# Read config from a env variable secrets file:

with open('envVars.local.txt', 'r') as f:
    config_string = '[0]\n' + f.read()
config = configparser.ConfigParser()
config.read_string(config_string)


config=config['0']
session = []

if 'TESTHOST' in os.environ and os.environ['TESTHOST'] == 'PRODUCTION':
    testhost = config['PRODUCTION_DOMAIN']
else:
    testhost = config['DOMAIN']

print("Testing on host", testhost)

#def pytest_namespace():
#    return {'session': {'current_word_queue': [],
#                        'current_challenge_queue' : [],
#                        'seen_words' : [],
#                        'seen_modules' : [],
#                        'token' : "" }}

@pytest.fixture(scope="session")
def access_token():
    url = 'https://'+testhost+'/api/game/login'
    
    # Body
    payload = {'username': config['TEST_PLAYER_VALID_USERNAME'],
               'password': config['TEST_PLAYER_VALID_PASSWORD'] }
    
    resp = requests.post(url, data=payload)       
    
    # Validate response headers and body contents, e.g. status code.
    assert resp.status_code == 200
    
    token = resp.json()['access_token']
    return token


@pytest.fixture(scope="session")
def session_variables():
    return  {}


def test_invalid_username():
    url = 'https://'+testhost+'/api/game/login'
    
    # Body
    payload = {'username': config['TEST_PLAYER_INVALID_USERNAME'],
               'password': config['TEST_PLAYER_INVALID_PASSWORD'] }
    
    resp = requests.post(url, data=payload)
    
    # Validate response headers and body contents, e.g. status code.
    assert resp.status_code == 401
    assert resp.text == 'invalid password or username'

def test_invalid_password():
    url = 'https://'+testhost+'/api/game/login'
    
    # Body
    payload = {'username': config['TEST_PLAYER_VALID_USERNAME'],
               'password': config['TEST_PLAYER_INVALID_PASSWORD'] }
    
    resp = requests.post(url, data=payload)

    # Validate response headers and body contents, e.g. status code.
    assert resp.status_code == 401
    assert resp.text == 'invalid password or username'


def login_and_get_token(username=None, password=None):
    url = 'https://'+testhost+'/api/game/login'
    
    # Body
    if username is None or password is None:
        payload = {'username': config['TEST_PLAYER_VALID_USERNAME'],
                   'password': config['TEST_PLAYER_VALID_PASSWORD'] }
    else:
        payload = {'username': username ,
                   'password': password }
    
    resp = requests.post(url, data=payload)       
    
    # Validate response headers and body contents, e.g. status code.
    assert resp.status_code == 200
    token = resp.json()['access_token']
    return token


    
#POST: /api/game/update/character PARAMS:character

def test_update_character(access_token):    
    token = access_token

    # Additional headers.
    headers = {'Authorization':  'Bearer %s' % token}
    
    url = 'https://'+testhost+'/api/game/update/character'
    payload = {'character' : '2' }
    
    # convert dict to json by json.dumps() for body data. 
    resp = requests.post(url, headers=headers, params=payload)
    
    # Validate response headers and body contents, e.g. status code.
    print(resp)
    assert resp.status_code == 200
    #resp_body = resp.json()
    #assert resp_body['url'] == url
    print(resp)


#POST: /api/game/update/coins PARAMS:coins


def test_update_coins(access_token):    
    token = access_token

    # Additional headers.
    headers = {'Authorization':  'Bearer %s' % token}
    
    url = 'https://'+testhost+'/api/game/update/coins'
    payload = {'coins' : '121' }

    
    # convert dict to json by json.dumps() for body data. 
    resp = requests.post(url, headers=headers, params=payload)
    
    # Validate response headers and body contents, e.g. status code.
    print(resp)
    assert resp.status_code == 200
    #resp_body = resp.json()
    #assert resp_body['url'] == url
    print(resp)


#POST: /api/game/create/wordlist PARAMS None
    
def test_get_words(access_token):
    token = access_token
    #session_variables['token'] = token
    
    url = 'https://'+testhost+'/api/game/create/wordlist'
    
    # Additional headers.
    headers = {'Authorization':  'Bearer %s' % token } 

    # Body
    #payload = {'access_token' : token}
    
    # convert dict to json by json.dumps() for body data. 
    #resp = requests.post(url, headers=headers, data=json.dumps(payload,indent=4))
    resp = requests.post(url, headers=headers)       
    
    # Validate response headers and body contents, e.g. status code.
    print(resp)
    assert resp.status_code == 200
    resp_body = resp.json()
    #assert resp_body['url'] == url
    print(resp)
    # print response full body as text
    print(resp.text)



def get_words(access_token):
    token = access_token
    headers = {'Authorization':  'Bearer %s' % token} 
    url = 'https://'+testhost+'/api/game/create/wordlist'
    resp = requests.post(url, headers=headers)       
    print(resp)
    resp_json = resp.json()
    return resp_json['chosenWords'], resp_json['cardType'], resp_json['module']




#POST: /api/game/update/highscore PARAMS: word, score, challange(->mem or rep)

def test_update_wordscores(access_token):    
    token = access_token

    # Additional headers.
    headers = {'Authorization':  'Bearer %s' % token} 
    url = 'https://'+testhost+'/api/game/update/highscore'


    seen_modules = []
    seen_words = []
    
    seen_modules_count = 0
    seen_words_count = 0

    rounds=5
    
    for leitner_level in range( 2 * rounds):
        words, challenge_types, module = get_words(access_token)
        print(words, challenge_types)
        current_word_queue = words
        current_challenge_queue = challenge_types
        if module not in seen_modules:
            seen_modules.append(module)

        for word_index_in_level in range(len(current_word_queue)):
            word = current_word_queue.pop()
            challenge_type = current_challenge_queue.pop()

            if word not in seen_words:
                seen_words.append(word)

            if leitner_level < rounds:
                score = 5
            else:
                score = 0
            # Body
            payload = {'word' : word,
                       'score' : score,
                       'challenge' : challenge_type }


            # convert dict to json by json.dumps() for body data. 
            resp = requests.post(url, headers=headers, params=payload)

            # Validate response headers and body contents, e.g. status code.
            print(resp)
            assert resp.status_code == 200
            #resp_body = resp.json()
            #assert resp_body['url'] == url
            #print(resp)
            # print response full body as text
            #print(word, resp.text)

            # if leitner_level == 2:
            #     # We should have seen more modules now than at round 0:
            #     assert len(seen_modules) > 0#seen_modules_count
            #     assert len(seen_words) > 0#seen_words_count

            #     seen_modules_count = len(seen_modules)
            #     seen_words_count = len(seen_words)
            
            # if leitner_level == rounds:
            #     # We should have seen more modules now than at round 2:
            #     assert len(seen_modules) > seen_modules_count
            #     assert len(seen_words) > seen_words_count

            #     seen_modules_count = len(seen_modules)
            #     seen_words_count = len(seen_words)

    # We should now have seen no more modules now than at round 10:
    assert len(seen_modules) > 2 #==seen_modules_count
    assert len(seen_words) > 10 #== seen_words_count

