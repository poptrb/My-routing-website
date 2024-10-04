import json
from datetime import datetime


def format_record(record):
    record['pubTime'] = datetime.utcfromtimestamp(record['pubMillis']/1000.0)
    record['pubTime'] = record['pubTime'].strftime('%Y-%m-%d %H:%M:%S')

    return record


def print_record(record):
    _ = {
        'wazeData': record['wazeData'],
        'pubTime': record['pubTime'],
        'street': record['street'] if 'street' in record.keys() else '',
        'uuid': record['uuid'],
        'location': record['location']
    }

    print(json.dumps(_, indent=4))


def format_response(response):
    try:
        formatted_response = {
            "status_code": response.status_code,
            "reason": response.reason,
            "headers": dict(response.headers),
            "date": response.date.strftime("%Y-%m-%d %H:%M:%S"),
            "body": response.body.decode('utf-8')
        }
        return formatted_response
    except Exception as e:
        print(f"RESPONSE STRUCTURE EXCEPTION: {response.__class__}: ",
              f"{str(dir(response))}",
              f"Original exception: {e}")
    else:
        return None


def process_geojson_response(response):
    data = json.loads(response['body'])
    for record in filter(lambda x: x['type'] in ['POLICE'], data['alerts']):
        record = format_record(record)

        #print_record(record)
        #print(json.dumps(record, indent=4))
