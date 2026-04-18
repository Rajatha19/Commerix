from graphviz import Digraph


def add_entity(graph, node_id, label):
    graph.node(
        node_id,
        label,
        shape="box",
        style="rounded,filled",
        fillcolor="white",
        color="#555555",
        fontname="Helvetica-Bold",
        fontsize="11",
        margin="0.14,0.08",
    )


def add_process(graph, node_id, label):
    graph.node(
        node_id,
        label,
        shape="ellipse",
        style="filled",
        fillcolor="#FAFBFC",
        color="#555555",
        fontname="Helvetica",
        fontsize="10",
        width="2.35",
        height="0.82",
    )


def add_store(graph, node_id, label):
    graph.node(
        node_id,
        label=f"{{ {label} }}",
        shape="record",
        style="rounded,filled",
        fillcolor="white",
        color="#555555",
        fontname="Helvetica",
        fontsize="10",
        margin="0.12,0.06",
    )


def add_flow(graph, source, target, bidirectional=False, minlen="1"):
    attrs = {
        "color": "#666666",
        "penwidth": "1.0",
        "arrowsize": "0.7",
        "fontname": "Helvetica",
        "fontsize": "8",
        "fontcolor": "#444444",
        "minlen": minlen,
    }
    if bidirectional:
        attrs["dir"] = "both"
    graph.edge(source, target, **attrs)


g = Digraph("gocart_dfd", format="png")

# A4 landscape-friendly layout.
g.attr(
    rankdir="TB",
    newrank="true",
    bgcolor="white",
    splines="ortho",
    nodesep="0.45",
    ranksep="0.72",
    pad="0.22",
    dpi="300",
    size="11.69,8.27!",
    ratio="compress",
    margin="0.08",
    labelloc="t",
    label="Data Flow Diagram of GoCart E-Commerce Platform",
    fontsize="20",
    fontname="Helvetica-Bold",
)
g.attr(
    "edge",
    color="#666666",
    penwidth="1.0",
    arrowsize="0.7",
    fontname="Helvetica",
    fontsize="8",
    forcelabels="true",
)

# External entities
with g.subgraph() as s:
    s.attr(rank="same")
    add_entity(s, "Vendor", "Vendor")
    add_entity(s, "User", "User")
    add_entity(s, "Admin", "Admin")
    add_entity(s, "Stripe", "Payment Gateway")
    add_entity(s, "AI", "AI Service")

# Core processes
with g.subgraph() as s:
    s.attr(rank="same")
    add_process(s, "P1", "1.0\nIdentity and\nProfile Management")
    add_process(s, "P2", "2.0\nCatalog and\nStore Management")
    add_process(s, "P3", "3.0\nOrder and\nPayment Processing")
    add_process(s, "P4", "4.0\nRecommendation and\nInsight Generation")
    add_process(s, "P5", "5.0\nMessaging and\nModeration")

# Data stores
with g.subgraph() as s:
    s.attr(rank="same")
    add_store(s, "D1", "D1 | User and Profile Data")
    add_store(s, "D2", "D2 | Store and Product Data")
    add_store(s, "D3", "D3 | Order and Payment Data")
    add_store(s, "D4", "D4 | Behavior and Insight Data")
    add_store(s, "D5", "D5 | Message and Report Data")

# Layout guides
for edge in [
    ("Vendor", "User"),
    ("User", "Admin"),
    ("Admin", "Stripe"),
    ("Stripe", "AI"),
    ("P1", "P2"),
    ("P2", "P3"),
    ("P3", "P4"),
    ("P4", "P5"),
    ("D1", "D2"),
    ("D2", "D3"),
    ("D3", "D4"),
    ("D4", "D5"),
]:
    g.edge(edge[0], edge[1], style="invis", weight="10")

# External entity flows
add_flow(g, "User", "P1")
add_flow(g, "User", "P2")
add_flow(g, "User", "P3")
add_flow(g, "User", "P5", minlen="2")

add_flow(g, "Vendor", "P2")
add_flow(g, "Vendor", "P3")
add_flow(g, "Vendor", "P4", minlen="2")
add_flow(g, "Vendor", "P5", minlen="2")

add_flow(g, "Admin", "P2")
add_flow(g, "Admin", "P4")
add_flow(g, "Admin", "P5")

add_flow(g, "P3", "Stripe", bidirectional=True)
add_flow(g, "P4", "AI", bidirectional=True)

# Process to data store exchanges
add_flow(g, "P1", "D1", bidirectional=True)
add_flow(g, "P2", "D2", bidirectional=True)
add_flow(g, "P3", "D3", bidirectional=True)
add_flow(g, "P4", "D4", bidirectional=True)
add_flow(g, "P5", "D5", bidirectional=True)

# Inter-process data movement
add_flow(g, "P2", "P3")
add_flow(g, "P3", "P4")
add_flow(g, "P5", "P4")

if __name__ == "__main__":
    output_path = g.render("data-flow-diagram-ieee", cleanup=True)
    print(f"Generated: {output_path}")
