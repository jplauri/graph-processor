import os
import urllib.parse
import boto3
import networkx as nx

s3 = boto3.client('s3')
sqs = boto3.client('sqs')


def preprocess(event, context):
    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    try:
        file_content = s3.get_object(
            Bucket=bucket, Key=key)["Body"].read()
        lines = [x.decode() for x in file_content.split()]

        print(lines)

        for graph in lines:
            response = sqs.send_message(
                QueueUrl=os.environ["target_queue"],
                DelaySeconds=0,
                MessageBody=graph
            )
            print(response)

        return {"message": "Success"}
    except Exception as e:
        print(f"Exception: {e}")
        raise e


def compute_properties(event, context):
    try:
        payload = event['Records']["body"]
        print(payload)

        g = nx.from_graph6_bytes(payload.encode())
        n = nx.number_of_nodes(g)
        m = nx.number_of_edges(g)

        print(f"for {payload} it holds that n = {n}, m = {m}")

    except Exception as e:
        print(f"Exception: {e}")
        raise e
