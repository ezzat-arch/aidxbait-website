export default {
	meta: {
		title: "Shipping Policy | Doctoory",
		description:
			"How Doctoory processes, ships, and tracks medical supply orders across Egypt.",
	},
	header: {
		h1: "Shipping Policy",
	},
	intro:
		"This Shipping Policy applies to all orders placed through our website and mobile application. We are committed to delivering your medical supplies safely and efficiently across Egypt.",
	s1: {
		h: "1. Order Processing Time",
		p: "All orders are processed within <b>24 hours</b> (excluding Fridays and public holidays).",
		items: [
			"Orders placed before <b>2:00 PM</b> are typically processed the same day.",
			"You will receive a notification via SMS or the app once your order has been dispatched.",
		],
	},
	s2: {
		h: "2. Delivery Timelines & Zones",
		table: {
			region: "Region",
			eta: "Estimated Delivery Time",
			rows: [
				{ region: "Cairo & Giza", eta: "24 – 48 Hours" },
				{ region: "Alexandria & Delta", eta: "2 – 3 Business Days" },
				{ region: "Upper Egypt & Red Sea", eta: "3 – 5 Business Days" },
			],
		},
	},
	s3: {
		h: "3. Shipping Rates",
		p: "Shipping fees are calculated based on your location and the total weight of the order. The final cost will be displayed clearly at checkout before you complete your purchase.",
	},
	s4: {
		h: "4. Temperature-Sensitive Items",
		p: "For medical supplies requiring specific storage (e.g., refrigerated items), we use specialized thermal packaging and priority handling to maintain product integrity. Please ensure someone is available to receive these items immediately upon delivery.",
	},
	s5: {
		h: "5. Order Tracking",
		p: "Once your order is out for delivery, you can track its status directly through the <b>My Orders</b> section on our website or mobile app.",
	},
	s6: {
		h: "6. Inspection & Receipt",
		p: "Upon delivery, please inspect the package for any visible damage. If the seal is broken or the product is damaged, please contact our Customer Support team immediately.",
	},
} as const;
