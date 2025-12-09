import { PostgrestError } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Custom error classes for address operations
 */
export class AddressNotFoundError extends Error {
	constructor() {
		super("Address not found.");
		this.name = "AddressNotFoundError";
	}
}

export class AddressAccessDeniedError extends Error {
	constructor() {
		super("You do not have permission to access this address.");
		this.name = "AddressAccessDeniedError";
	}
}

/**
 * Address type matching the database schema
 */
export type AddressType = "House" | "Apartment";

export interface Address {
	id: number;
	patient_id: number;
	address_type: AddressType;
	address_label: string;
	google_map_url?: string;
	latitude?: number;
	longitude?: number;
	governorate: string;
	city: string;
	street: string;
	building_name?: string;
	floor?: string;
	apartment?: string;
	additional_directions?: string;
	phone?: string;
	is_primary: boolean;
	is_deleted: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface CreateAddressData {
	patient_id: number;
	address_type: AddressType;
	address_label: string;
	google_map_url?: string;
	latitude?: number;
	longitude?: number;
	governorate: string;
	city: string;
	street: string;
	building_name?: string;
	floor?: string;
	apartment?: string;
	additional_directions?: string;
	phone?: string;
	is_primary?: boolean;
}

export interface UpdateAddressData {
	address_type?: AddressType;
	address_label?: string;
	google_map_url?: string;
	latitude?: number;
	longitude?: number;
	governorate?: string;
	city?: string;
	street?: string;
	building_name?: string;
	floor?: string;
	apartment?: string;
	additional_directions?: string;
	phone?: string;
	is_primary?: boolean;
}

/**
 * Fetch all addresses for a patient (excluding soft-deleted ones)
 *
 * @param patientId - The patient's ID
 * @returns Array of addresses
 */
export async function getAddressesByPatientId(
	patientId: number
): Promise<Address[]> {
	const { data, error } = await supabaseAdmin
		.from("patient_addresses")
		.select("*")
		.eq("patient_id", patientId)
		.eq("is_deleted", false)
		.order("id", { ascending: true });

	if (error) {
		throw error;
	}

	return data || [];
}

/**
 * Fetch a single address by ID
 *
 * @param patientId - The patient's ID (for authorization)
 * @param addressId - The address ID
 * @returns The address
 * @throws AddressNotFoundError if address doesn't exist
 * @throws AddressAccessDeniedError if address belongs to another patient
 */
export async function getAddressById(
	patientId: number,
	addressId: number
): Promise<Address> {
	const { data, error } = await supabaseAdmin
		.from("patient_addresses")
		.select("*")
		.eq("id", addressId)
		.eq("is_deleted", false)
		.single();

	if (error) {
		if (error.code === "PGRST116") {
			throw new AddressNotFoundError();
		}
		throw error;
	}

	// Verify the address belongs to the patient
	if (data.patient_id !== patientId) {
		throw new AddressAccessDeniedError();
	}

	return data;
}

/**
 * Create a new address for a patient
 *
 * @param data - Address creation data
 * @returns The created address
 */
export async function createAddress(data: CreateAddressData): Promise<Address> {
	// If this is marked as primary, unset any existing primary address
	if (data.is_primary) {
		await supabaseAdmin
			.from("patient_addresses")
			.update({ is_primary: false })
			.eq("patient_id", data.patient_id)
			.eq("is_primary", true);
	}

	const { data: address, error } = await supabaseAdmin
		.from("patient_addresses")
		.insert([
			{
				patient_id: data.patient_id,
				address_type: data.address_type,
				address_label: data.address_label,
				google_map_url: data.google_map_url,
				latitude: data.latitude,
				longitude: data.longitude,
				governorate: data.governorate,
				city: data.city,
				street: data.street,
				building_name: data.building_name,
				floor: data.floor,
				apartment: data.apartment,
				additional_directions: data.additional_directions,
				phone: data.phone,
				is_primary: data.is_primary ?? false,
				is_deleted: false,
			},
		])
		.select("*")
		.single();

	if (error) {
		throw error;
	}

	return address;
}

/**
 * Update an existing address
 *
 * @param patientId - The patient's ID (for authorization)
 * @param addressId - The address ID to update
 * @param data - Address update data
 * @returns The updated address
 * @throws AddressNotFoundError if address doesn't exist
 * @throws AddressAccessDeniedError if address belongs to another patient
 */
export async function updateAddress(
	patientId: number,
	addressId: number,
	data: UpdateAddressData
): Promise<Address> {
	// First verify the address exists and belongs to the patient
	await getAddressById(patientId, addressId);

	// If setting as primary, unset any existing primary address
	if (data.is_primary) {
		await supabaseAdmin
			.from("patient_addresses")
			.update({ is_primary: false })
			.eq("patient_id", patientId)
			.eq("is_primary", true)
			.neq("id", addressId);
	}

	const { data: address, error } = await supabaseAdmin
		.from("patient_addresses")
		.update({
			...data,
			updated_at: new Date().toISOString(),
		})
		.eq("id", addressId)
		.select("*")
		.single();

	if (error) {
		throw error;
	}

	return address;
}

/**
 * Soft delete an address
 *
 * @param patientId - The patient's ID (for authorization)
 * @param addressId - The address ID to delete
 * @throws AddressNotFoundError if address doesn't exist
 * @throws AddressAccessDeniedError if address belongs to another patient
 */
export async function deleteAddress(
	patientId: number,
	addressId: number
): Promise<void> {
	// First verify the address exists and belongs to the patient
	await getAddressById(patientId, addressId);

	const { error } = await supabaseAdmin
		.from("patient_addresses")
		.update({
			is_deleted: true,
			is_primary: false, // Unset primary if deleting
			updated_at: new Date().toISOString(),
		})
		.eq("id", addressId);

	if (error) {
		throw error;
	}
}

/**
 * Set an address as primary (and unset others)
 *
 * @param patientId - The patient's ID
 * @param addressId - The address ID to set as primary
 * @returns The updated address
 * @throws AddressNotFoundError if address doesn't exist
 * @throws AddressAccessDeniedError if address belongs to another patient
 */
export async function setPrimaryAddress(
	patientId: number,
	addressId: number
): Promise<Address> {
	// First verify the address exists and belongs to the patient
	await getAddressById(patientId, addressId);

	// Unset any existing primary address
	await supabaseAdmin
		.from("patient_addresses")
		.update({ is_primary: false, updated_at: new Date().toISOString() })
		.eq("patient_id", patientId)
		.eq("is_primary", true);

	// Set the new primary address
	const { data: address, error } = await supabaseAdmin
		.from("patient_addresses")
		.update({ is_primary: true, updated_at: new Date().toISOString() })
		.eq("id", addressId)
		.select("*")
		.single();

	if (error) {
		throw error;
	}

	return address;
}

/**
 * Helper to translate Supabase errors into user-friendly strings.
 */
export function translateSupabaseError(error: PostgrestError): string {
	switch (error.code) {
		case "23505":
			return "An address with these details already exists.";
		case "23503":
			return "Invalid reference data provided.";
		case "23502":
			return "Required field is missing.";
		case "23514":
			return 'Invalid address type. Must be "House" or "Apartment".';
		default:
			return error.message || "An unexpected database error occurred.";
	}
}
