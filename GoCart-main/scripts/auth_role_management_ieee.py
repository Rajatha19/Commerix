from graphviz import Digraph


def add_box(graph, node_id, label, fill="white"):
    graph.node(
        node_id,
        label,
        shape="box",
        style="rounded,filled",
        fillcolor=fill,
        color="#555555",
        fontname="Helvetica",
        fontsize="11",
        margin="0.14,0.08",
    )


def add_store(graph, node_id, label):
    graph.node(
        node_id,
        label,
        shape="cylinder",
        style="filled",
        fillcolor="white",
        color="#555555",
        fontname="Helvetica",
        fontsize="10",
    )


g = Digraph("auth_role_management", format="png")

g.attr(
    rankdir="TB",
    bgcolor="white",
    splines="ortho",
    nodesep="0.55",
    ranksep="0.8",
    pad="0.22",
    dpi="300",
    size="11.69,8.27!",
    ratio="compress",
    labelloc="t",
    label="User Authentication and Role Management",
    fontsize="20",
    fontname="Helvetica-Bold",
)
g.attr(
    "edge",
    color="#666666",
    penwidth="1.0",
    arrowsize="0.7",
)

# Actors
with g.subgraph() as s:
    s.attr(rank="same")
    add_box(s, "Customer", "Customer")
    add_box(s, "Vendor", "Vendor")
    add_box(s, "Admin", "Administrator")

# Core services
with g.subgraph() as s:
    s.attr(rank="same")
    add_box(s, "Auth", "Authentication\nService", fill="#FAFBFC")
    add_box(s, "Roles", "Role Management\nand Access Control", fill="#FAFBFC")

# Accessed modules
with g.subgraph() as s:
    s.attr(rank="same")
    add_box(s, "Portal", "Customer Portal")
    add_box(s, "VendorDash", "Vendor Dashboard")
    add_box(s, "AdminDash", "Admin Dashboard")

# Data store
add_store(g, "IdentityDB", "Identity and Role DB")

# Layout guides
for edge in [
    ("Customer", "Vendor"),
    ("Vendor", "Admin"),
    ("Auth", "Roles"),
    ("Portal", "VendorDash"),
    ("VendorDash", "AdminDash"),
]:
    g.edge(edge[0], edge[1], style="invis", weight="10")

# Flows
g.edge("Customer", "Auth")
g.edge("Vendor", "Auth")
g.edge("Admin", "Auth")

g.edge("Auth", "Roles")
g.edge("Roles", "IdentityDB", dir="both")

g.edge("Roles", "Portal")
g.edge("Roles", "VendorDash")
g.edge("Roles", "AdminDash")

if __name__ == "__main__":
    output_path = g.render("auth-role-management-ieee", cleanup=True)
    print(f"Generated: {output_path}")
