from graphviz import Digraph


def add_box(graph, node_id, label, fill="#F9FBFD"):
    graph.node(
        node_id,
        label,
        shape="box",
        style="rounded,filled",
        fillcolor=fill,
        color="#C9D2DA",
        fontname="Helvetica",
        fontsize="11",
        margin="0.14,0.08",
    )


def add_db(graph, node_id, label):
    graph.node(
        node_id,
        label,
        shape="cylinder",
        style="filled",
        fillcolor="#EEF5FF",
        color="#9BB8D3",
        fontname="Helvetica",
        fontsize="11",
        margin="0.12,0.06",
    )


g = Digraph("gocart_db_schema", format="png")

g.attr(
    rankdir="TB",
    bgcolor="white",
    splines="ortho",
    nodesep="0.55",
    ranksep="0.75",
    pad="0.25",
    dpi="300",
    label="Database Layer",
    labelloc="t",
    fontsize="22",
    fontname="Times New Roman Bold",
)
g.attr(
    "edge",
    color="#A8B7C2",
    penwidth="1.2",
    arrowsize="0.7",
    fontname="Helvetica",
    fontsize="9",
)

# Top layer
with g.subgraph() as s:
    s.attr(rank="same")
    add_box(s, "UserPortal", "User Portal", fill="#F6FAF8")
    add_box(s, "AdminDashboard", "Admin Dashboard", fill="#F6FAF8")

# Service layer
with g.subgraph() as s:
    s.attr(rank="same")
    add_box(s, "AuthService", "Authentication\nService")
    add_box(s, "CommerceService", "Commerce\nService")
    add_box(s, "OrderService", "Order\nService")
    add_box(s, "RecService", "Recommendation\nService")
    add_box(s, "AdminAIService", "Admin and AI\nService")

# Data abstraction layer
with g.subgraph() as s:
    s.attr(rank="same")
    add_box(s, "UserData", "User and Profile\nData", fill="#FFFFFF")
    add_box(s, "CatalogData", "Store and Product\nData", fill="#FFFFFF")
    add_box(s, "TransactionData", "Order and Address\nData", fill="#FFFFFF")
    add_box(s, "BehaviorData", "Behavior and Engagement\nData", fill="#FFFFFF")
    add_box(s, "InsightData", "Insight and Report\nData", fill="#FFFFFF")

# Database layer
with g.subgraph() as s:
    s.attr(rank="same")
    add_db(s, "D1", "D1\nUser DB")
    add_db(s, "D2", "D2\nCommerce DB")
    add_db(s, "D3", "D3\nTransaction DB")
    add_db(s, "D4", "D4\nAnalytics DB")

# Top to services
g.edge("UserPortal", "AuthService")
g.edge("UserPortal", "CommerceService")
g.edge("UserPortal", "OrderService")
g.edge("UserPortal", "RecService")

g.edge("AdminDashboard", "CommerceService")
g.edge("AdminDashboard", "AdminAIService")
g.edge("AdminDashboard", "RecService")

# Services to abstracted data blocks
g.edge("AuthService", "UserData")
g.edge("CommerceService", "CatalogData")
g.edge("OrderService", "TransactionData")
g.edge("RecService", "BehaviorData")
g.edge("AdminAIService", "InsightData")

g.edge("CommerceService", "BehaviorData")
g.edge("OrderService", "BehaviorData")
g.edge("AdminAIService", "CatalogData")

# Data blocks to databases
g.edge("UserData", "D1")
g.edge("CatalogData", "D2")
g.edge("TransactionData", "D3")
g.edge("BehaviorData", "D3")
g.edge("BehaviorData", "D4")
g.edge("InsightData", "D4")
g.edge("InsightData", "D2")

if __name__ == "__main__":
    output_path = g.render("db-diagram-ieee", cleanup=True)
    print(f"Generated: {output_path}")
