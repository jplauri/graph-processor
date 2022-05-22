import networkx as nx

def compute_properties(event, context):
    try:
        for record in event['Records']:
            payload = record["body"]

            g = nx.from_graph6_bytes(payload.encode())
            n = nx.number_of_nodes(g)
            m = nx.number_of_edges(g)
            print(f"for {payload} it holds that n = {n}, m = {m}")

    except Exception as e:
        print(f"Exception: {e}")
        raise e
