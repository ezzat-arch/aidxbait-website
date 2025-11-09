'use client';

import Error from 'next/error';

// Root not-found page for non-localized paths
export default function NotFound() {
	return (
		<html lang="en">
			<body>
				<Error statusCode={404} />
			</body>
		</html>
	);
}

