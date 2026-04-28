export const mockComplaints = [
  {
    id: "#RC-8821",
    slug: "RC-8821",
    title: "Delayed Delivery of Electronics Item",
    category: "Delivery",
    priority: "High",
    status: "Investigating",
    submittedAt: "Oct 12, 2023, 09:30",
    lastUpdated: "2 hours ago",
    customer: "Alex Johnson",
    email: "my@gmail.com",
    phone: "(555) 012-4567",
    orderId: "ORD-10492",
    description:
      "The electronics item was scheduled for delivery three days ago, but tracking has not changed and support has not provided an updated delivery date.",
    evidence: ["delivery-confirmation.pdf", "tracking-screenshot.png"],
    timeline: [
      { title: "Complaint submitted", meta: "Oct 12, 09:30", detail: "Customer submitted the complaint and evidence.", state: "complete" },
      { title: "Validation complete", meta: "Oct 12, 14:15", detail: "Customer service confirmed the complaint is valid.", state: "complete" },
      { title: "Investigation started", meta: "In progress", detail: "Investigator is checking carrier and warehouse records.", state: "active" },
      { title: "Manager approval", meta: "Pending", detail: "Resolution will be sent for approval after investigation.", state: "pending" },
    ],
    resolution: "Investigation is still in progress. A shipping update is expected from the logistics partner.",
  },
  {
    id: "#RC-8819",
    slug: "RC-8819",
    title: "Incorrect Billing on Service Plan",
    category: "Billing",
    priority: "Medium",
    status: "Pending",
    submittedAt: "Oct 11, 2023, 16:45",
    lastUpdated: "Yesterday",
    customer: "Alex Johnson",
    email: "my@gmail.com",
    phone: "(555) 012-4567",
    orderId: "INV-55210",
    description: "The monthly service plan was charged twice on the same invoice cycle.",
    evidence: ["billing-statement.pdf"],
    timeline: [
      { title: "Complaint submitted", meta: "Oct 11, 16:45", detail: "Billing documents were received.", state: "complete" },
      { title: "Awaiting validation", meta: "Pending", detail: "Customer service has not reviewed this complaint yet.", state: "active" },
    ],
    resolution: "No resolution has been proposed yet.",
  },
  {
    id: "#RC-8794",
    slug: "RC-8794",
    title: "Technical Error during Checkout",
    category: "Technical",
    priority: "Low",
    status: "Resolved",
    submittedAt: "Oct 8, 2023, 10:20",
    lastUpdated: "3 days ago",
    customer: "Alex Johnson",
    email: "my@gmail.com",
    phone: "(555) 012-4567",
    orderId: "CHK-77420",
    description: "Checkout returned an error after payment authorization, and the cart did not create an order.",
    evidence: ["checkout-error.png"],
    timeline: [
      { title: "Complaint submitted", meta: "Oct 8, 10:20", detail: "Screenshot was attached.", state: "complete" },
      { title: "Issue investigated", meta: "Oct 9, 13:10", detail: "Payment gateway timeout was confirmed.", state: "complete" },
      { title: "Resolved", meta: "Oct 10, 15:35", detail: "Authorization was released and checkout was restored.", state: "complete" },
    ],
    resolution: "The duplicate authorization was released and checkout service is operating normally.",
  },
  {
    id: "#RC-8752",
    slug: "RC-8752",
    title: "Damaged Product on Arrival",
    category: "Product Quality",
    priority: "Medium",
    status: "Resolved",
    submittedAt: "Oct 5, 2023, 12:05",
    lastUpdated: "Oct 05, 2023",
    customer: "Alex Johnson",
    email: "my@gmail.com",
    phone: "(555) 012-4567",
    orderId: "ORD-10110",
    description: "The product arrived with visible damage to the casing and packaging.",
    evidence: ["damaged-product.jpg", "shipping-label.jpg"],
    timeline: [
      { title: "Complaint submitted", meta: "Oct 5, 12:05", detail: "Photos were attached.", state: "complete" },
      { title: "Replacement approved", meta: "Oct 5, 16:20", detail: "Manager approved a replacement shipment.", state: "complete" },
    ],
    resolution: "A replacement was approved and sent to the customer.",
  },
  {
    id: "#RC-8711",
    slug: "RC-8711",
    title: "Membership Subscription Issue",
    category: "Account",
    priority: "Low",
    status: "In Progress",
    submittedAt: "Sep 28, 2023, 08:55",
    lastUpdated: "Sep 28, 2023",
    customer: "Alex Johnson",
    email: "my@gmail.com",
    phone: "(555) 012-4567",
    orderId: "MEM-2048",
    description: "Membership benefits are not visible even though the subscription is active.",
    evidence: ["membership-status.png"],
    timeline: [
      { title: "Complaint submitted", meta: "Sep 28, 08:55", detail: "Account details were received.", state: "complete" },
      { title: "Account review", meta: "In progress", detail: "Support team is reviewing subscription sync logs.", state: "active" },
    ],
    resolution: "Account sync is being reviewed.",
  },
];

export const getStoredComplaints = () => {
  try {
    return JSON.parse(window.localStorage.getItem("demoComplaints") || "[]");
  } catch {
    return [];
  }
};

export const getAllComplaints = () => [...getStoredComplaints(), ...mockComplaints];

export const findComplaintBySlug = (slug) =>
  getAllComplaints().find((complaint) => complaint.slug.toLowerCase() === slug.toLowerCase());

export const createComplaintSlug = (id) => id.replace("#", "");
