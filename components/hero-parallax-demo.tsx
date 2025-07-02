"use client";
import React from "react";
import { HeroParallax } from "./ui/hero-parallax";

export function HeroParallaxDemo() {
	return <HeroParallax products={products} />;
}

export const products = [
	{
		title: "Physical Therapy Sessions",
		link: "/services/exercise-programs",
		thumbnail:
			"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Post-Surgery Recovery",
		link: "/services/post-surgery",
		thumbnail:
			"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Knee Replacement Care",
		link: "/testimonials/knee-replacement",
		thumbnail:
			"https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Sports Medicine",
		link: "/services/sports-rehab",
		thumbnail:
			"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Pain Management",
		link: "/services/pain-management",
		thumbnail:
			"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Chronic Care Support",
		link: "/services/chronic-care",
		thumbnail:
			"https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Home Visits",
		link: "/services/pt-home-visits",
		thumbnail:
			"https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Online Consultations",
		link: "/services/online-consultations",
		thumbnail:
			"https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Exercise Tracking",
		link: "/app/exercise-tracking",
		thumbnail:
			"https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Provider Portal",
		link: "/providers/portal",
		thumbnail:
			"https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Medication Management",
		link: "/app/medications",
		thumbnail:
			"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Emergency Support",
		link: "/contact/emergency",
		thumbnail:
			"https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Wearable Integration",
		link: "/app/wearables",
		thumbnail:
			"https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Analytics Dashboard",
		link: "/app/analytics",
		thumbnail:
			"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
	},
	{
		title: "Recovery Stories",
		link: "/testimonials/recovery",
		thumbnail:
			"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=60",
	},
];
