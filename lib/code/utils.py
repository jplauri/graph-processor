import os
import urllib.parse
import boto3


s3 = boto3.client('s3')
#dynamodb = boto3.client('dynamodb')


def handler(event, context):
    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    try:
        file_content = s3.get_object(
            Bucket=bucket, Key=key)["Body"].read()
        lines = [x.decode() for x in file_content.split()]

        print(lines)

        #dynamodb = boto3.resource('dynamodb', region_name="eu-north-1")
        #table = dynamodb.Table(os.environ["target_table"])

        #for word in [w for w in lines if not w.isnumeric()]:
        #    print(f"Pushing: {word}")
        #    response = table.put_item(Item={"word": word})
        #    print(response)

        return {"message": "Success"}
    except Exception as e:
        print(f"Exception: {e}")
        raise e
