from graphviz import Digraph, nohtml


def add_actor(graph, node_id, name):
    label = f"""<
    <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0">
        <TR><TD ALIGN="CENTER"><FONT FACE="Helvetica" POINT-SIZE="18">O</FONT></TD></TR>
        <TR><TD ALIGN="CENTER"><FONT FACE="Helvetica" POINT-SIZE="16">/|\\</FONT></TD></TR>
        <TR><TD ALIGN="CENTER"><FONT FACE="Helvetica" POINT-SIZE="16">/ \\</FONT></TD></TR>
        <TR><TD HEIGHT="5"></TD></TR>
        <TR><TD ALIGN="CENTER"><FONT FACE="Helvetica" POINT-SIZE="12">{name}</FONT></TD></TR>
    </TABLE>
    >"""
    graph.node(node_id, label=label, shape="none")


def add_use_case(graph, node_id, label, width="2.3"):
    graph.node(
        node_id,
        label,
        shape="ellipse",
        style="filled",
        fillcolor="white",
        color="#555555",
        fontname="Helvetica",
        fontsize="10",
        width=width,
        height="0.72",
    )


def add_spacer(graph, node_id):
    graph.node(node_id, "", shape="point", width="0.01", style="invis")


g = Digraph("gocart_use_case", format="png")

g.attr(
    rankdir="TB",
    newrank="true",
    bgcolor="white",
    splines="polyline",
    nodesep="0.55",
    ranksep="0.75",
    pad="0.22",
    dpi="300",
    size="11.69,8.27!",
    ratio="compress",
    labelloc="t",
    label="Use Case Diagram of GoCart E-Commerce Platform",
    fontsize="20",
    fontname="Helvetica-Bold",
)
g.attr(
    "edge",
    color="#555555",
    penwidth="1.0",
    arrowsize="0.7",
    fontname="Helvetica",
    fontsize="9",
)

add_actor(g, "User", "User")
add_actor(g, "Vendor", "Vendor")
add_actor(g, "Admin", "Admin")

for spacer in ["L1", "L3", "L4", "L5", "R2", "R3", "R5"]:
    add_spacer(g, spacer)

with g.subgraph(name="cluster_system") as c:
    c.attr(
        label="GoCart Platform",
        color="#666666",
        bgcolor="white",
        fontname="Helvetica-Bold",
        fontsize="13",
        margin="16",
    )

    # User use cases
    add_use_case(c, "UC_Auth", "Register / Login")
    add_use_case(c, "UC_Browse", "Browse Catalog")
    add_use_case(c, "UC_Order", "Manage Cart,\nCheckout, and Orders", width="2.5")
    add_use_case(c, "UC_Feedback", "Submit Ratings,\nReviews, and Reports", width="2.45")
    add_use_case(c, "UC_AI", "Use AI\nRecommendations")

    # Vendor use cases
    add_use_case(c, "VC_Profile", "Manage Store\nProfile")
    add_use_case(c, "VC_Catalog", "Manage Products\nand Inventory")
    add_use_case(c, "VC_Orders", "Process\nCustomer Orders")
    add_use_case(c, "VC_Insights", "View Dashboard,\nInsights, and Messages", width="2.55")

    # Admin use cases
    add_use_case(c, "AC_Dashboard", "Monitor Admin\nDashboard")
    add_use_case(c, "AC_Stores", "Approve and\nManage Stores")
    add_use_case(c, "AC_Reports", "Review Reports\nand Vendor Risk")
    add_use_case(c, "AC_Content", "Moderate Catalog,\nCoupons, and Notices", width="2.55")

    # Supporting use cases
    add_use_case(c, "SC_Address", "Manage\nAddresses", width="1.8")
    add_use_case(c, "SC_Payment", "Process\nPayment", width="1.8")
    add_use_case(c, "SC_AIOverview", "Generate AI\nOverview", width="1.9")

# Main rows
with g.subgraph() as row1:
    row1.attr(rank="same")
    row1.node("L1")
    row1.node("UC_Auth")
    row1.node("VC_Profile")
    row1.node("AC_Dashboard")
    row1.node("Vendor")

with g.subgraph() as row2:
    row2.attr(rank="same")
    row2.node("User")
    row2.node("UC_Browse")
    row2.node("VC_Catalog")
    row2.node("AC_Stores")
    row2.node("R2")

with g.subgraph() as row3:
    row3.attr(rank="same")
    row3.node("L3")
    row3.node("UC_Order")
    row3.node("VC_Orders")
    row3.node("AC_Reports")
    row3.node("R3")

with g.subgraph() as row4:
    row4.attr(rank="same")
    row4.node("L4")
    row4.node("UC_Feedback")
    row4.node("VC_Insights")
    row4.node("AC_Content")
    row4.node("Admin")

with g.subgraph() as row5:
    row5.attr(rank="same")
    row5.node("L5")
    row5.node("UC_AI")
    row5.node("SC_Address")
    row5.node("SC_Payment")
    row5.node("SC_AIOverview")
    row5.node("R5")

# Invisible guides keep the columns aligned.
for edge in [
    ("L1", "UC_Auth"),
    ("UC_Auth", "VC_Profile"),
    ("VC_Profile", "AC_Dashboard"),
    ("AC_Dashboard", "Vendor"),
    ("User", "UC_Browse"),
    ("UC_Browse", "VC_Catalog"),
    ("VC_Catalog", "AC_Stores"),
    ("AC_Stores", "R2"),
    ("L3", "UC_Order"),
    ("UC_Order", "VC_Orders"),
    ("VC_Orders", "AC_Reports"),
    ("AC_Reports", "R3"),
    ("L4", "UC_Feedback"),
    ("UC_Feedback", "VC_Insights"),
    ("VC_Insights", "AC_Content"),
    ("AC_Content", "Admin"),
    ("L5", "UC_AI"),
    ("UC_AI", "SC_Address"),
    ("SC_Address", "SC_Payment"),
    ("SC_Payment", "SC_AIOverview"),
    ("SC_AIOverview", "R5"),
    ("UC_Auth", "UC_Browse"),
    ("UC_Browse", "UC_Order"),
    ("UC_Order", "UC_Feedback"),
    ("UC_Feedback", "UC_AI"),
    ("VC_Profile", "VC_Catalog"),
    ("VC_Catalog", "VC_Orders"),
    ("VC_Orders", "VC_Insights"),
    ("AC_Dashboard", "AC_Stores"),
    ("AC_Stores", "AC_Reports"),
    ("AC_Reports", "AC_Content"),
]:
    g.edge(edge[0], edge[1], style="invis", weight="10")

# Actor associations
for use_case in ["UC_Auth", "UC_Browse", "UC_Order", "UC_Feedback", "UC_AI"]:
    g.edge("User", use_case, dir="none")

for use_case in ["VC_Profile", "VC_Catalog", "VC_Orders", "VC_Insights"]:
    g.edge("Vendor", use_case, dir="none")

for use_case in ["AC_Dashboard", "AC_Stores", "AC_Reports", "AC_Content"]:
    g.edge("Admin", use_case, dir="none")

# UML include relations
g.edge("UC_Order", "SC_Address", style="dashed", arrowhead="open", label=nohtml("<<include>>"))
g.edge("UC_Order", "SC_Payment", style="dashed", arrowhead="open", label=nohtml("<<include>>"))
g.edge("AC_Reports", "SC_AIOverview", style="dashed", arrowhead="open", label=nohtml("<<include>>"))

if __name__ == "__main__":
    output_path = g.render("use-case-diagram-ieee", cleanup=True)
    print(f"Generated: {output_path}")
