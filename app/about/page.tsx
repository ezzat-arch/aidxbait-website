export default function AboutPage() {
	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold mb-8 text-center">About AidXBait</h1>

				<div className="space-y-8">
					<section>
						<h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
						<p className="text-lg text-gray-600 leading-relaxed">
							To revolutionize healthcare delivery by making quality medical
							services accessible at home, empowering patients to receive
							professional care in the comfort of their own environment.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
						<p className="text-lg text-gray-600 leading-relaxed">
							We are committed to providing comprehensive, technology-driven
							healthcare solutions that bridge the gap between patients and
							medical professionals, ensuring convenient, efficient, and
							personalized care for everyone.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
