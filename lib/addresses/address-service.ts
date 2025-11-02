import type {
	PatientAddress,
	CreateAddressRequest,
	UpdateAddressRequest,
	AddressResponse,
	AddressesResponse,
} from "@/lib/order-types";

/**
 * Fetch all addresses for a patient
 */
export async function fetchAddresses(
	patientId: number
): Promise<PatientAddress[]> {
	const startTime = Date.now();
	console.log("[ADDRESS-SERVICE-DEBUG] fetchAddresses called:", {
		patientId,
		timestamp: new Date().toISOString(),
	});
	
	try {
		console.log("[ADDRESS-SERVICE-DEBUG] Initiating fetch request to /api/addresses");
		const fetchStartTime = Date.now();
		
		const response = await fetch(`/api/addresses?patient_id=${patientId}`);
		
		const fetchDuration = Date.now() - fetchStartTime;
		console.log("[ADDRESS-SERVICE-DEBUG] Fetch request completed:", {
			status: response.status,
			statusText: response.statusText,
			ok: response.ok,
			fetchDurationMs: fetchDuration,
			timestamp: new Date().toISOString(),
		});

		if (!response.ok) {
			console.error("[ADDRESS-SERVICE-DEBUG] Response not OK - attempting to parse error");
			const error = await response
				.json()
				.catch(() => ({ error: "Failed to fetch addresses" }));
			console.error("[ADDRESS-SERVICE-DEBUG] Error response:", {
				status: response.status,
				error,
				timestamp: new Date().toISOString(),
			});
			throw new Error(error.error || "Failed to fetch addresses");
		}

		console.log("[ADDRESS-SERVICE-DEBUG] Parsing successful response...");
		const data: AddressesResponse = await response.json();

		if (!data.success || !data.data) {
			console.error("[ADDRESS-SERVICE-DEBUG] Response indicates failure:", {
				success: data.success,
				hasData: !!data.data,
				error: data.error,
				timestamp: new Date().toISOString(),
			});
			throw new Error(data.error || "Failed to fetch addresses");
		}

		const totalDuration = Date.now() - startTime;
		console.log("[ADDRESS-SERVICE-DEBUG] Addresses fetched successfully:", {
			addressCount: data.data.length,
			totalDurationMs: totalDuration,
			timestamp: new Date().toISOString(),
		});

		return data.data;
	} catch (error) {
		const totalDuration = Date.now() - startTime;
		console.error("[ADDRESS-SERVICE-DEBUG] Error fetching addresses:", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			patientId,
			totalDurationMs: totalDuration,
			timestamp: new Date().toISOString(),
		});
		throw error;
	}
}

/**
 * Create a new patient address
 */
export async function createAddress(
	addressData: CreateAddressRequest
): Promise<PatientAddress> {
	try {
		const response = await fetch("/api/addresses", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(addressData),
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ error: "Failed to create address" }));
			throw new Error(error.error || "Failed to create address");
		}

		const data: AddressResponse = await response.json();

		if (!data.success || !data.data) {
			throw new Error(data.error || "Failed to create address");
		}

		return data.data;
	} catch (error) {
		console.error("[AddressService] Error creating address:", error);
		throw error;
	}
}

/**
 * Update an existing address
 */
export async function updateAddress(
	addressId: number,
	patientId: number,
	updateData: UpdateAddressRequest
): Promise<PatientAddress> {
	try {
		const response = await fetch(`/api/addresses/${addressId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				patient_id: patientId,
				...updateData,
			}),
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ error: "Failed to update address" }));
			throw new Error(error.error || "Failed to update address");
		}

		const data: AddressResponse = await response.json();

		if (!data.success || !data.data) {
			throw new Error(data.error || "Failed to update address");
		}

		return data.data;
	} catch (error) {
		console.error("[AddressService] Error updating address:", error);
		throw error;
	}
}

/**
 * Soft delete an address
 */
export async function deleteAddress(
	addressId: number,
	patientId: number
): Promise<void> {
	try {
		const response = await fetch(
			`/api/addresses/${addressId}?patient_id=${patientId}`,
			{
				method: "DELETE",
			}
		);

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ error: "Failed to delete address" }));
			throw new Error(error.error || "Failed to delete address");
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(data.error || "Failed to delete address");
		}
	} catch (error) {
		console.error("[AddressService] Error deleting address:", error);
		throw error;
	}
}

/**
 * Set an address as primary
 */
export async function setAsPrimary(
	addressId: number,
	patientId: number
): Promise<PatientAddress> {
	return updateAddress(addressId, patientId, { is_primary: true });
}

/**
 * Get the primary address for a patient
 */
export async function getPrimaryAddress(
	patientId: number
): Promise<PatientAddress | null> {
	try {
		const addresses = await fetchAddresses(patientId);
		return addresses.find((addr) => addr.is_primary) || null;
	} catch (error) {
		console.error("[AddressService] Error getting primary address:", error);
		throw error;
	}
}
