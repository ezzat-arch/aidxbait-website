import { Suspense } from "react";
import ProvidersClient from "./ProvidersClient";

const ProvidersPage = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ProvidersClient />
		</Suspense>
	);
};

export default ProvidersPage;
